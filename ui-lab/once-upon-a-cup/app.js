const stage = document.querySelector('#stage');
const exploreButton = document.querySelector('#explore');
const openButton = document.querySelector('#open-scene');
const tools = document.querySelector('#scene-tools');
const help = document.querySelector('#viewer-help');
const status = document.querySelector('#viewer-status');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const moodButtons = [...document.querySelectorAll('button[data-mood]')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const captions = {
  overview: 'あるところに、本の上の小さな喫茶店がありました。',
  terrace: '木陰のテラス席。今日は、コーヒーが冷めるまでゆっくり。',
  patisserie: '甘い香りに誘われて。小さなワゴンで、午後のおやつを。',
};
let viewer = null;
let pending = null;
let active = false;
let loadState = 'poster';
let metrics = {};
let actionSerial = 0;
const errors = [];
const diagnostics = new URLSearchParams(location.search).has('debug');
let debugPanel;

if (diagnostics) {
  debugPanel = document.createElement('pre');
  debugPanel.id = 'cup-debug';
  debugPanel.className = 'debug-panel';
  debugPanel.setAttribute('aria-label', '開発用診断');
  document.body.append(debugPanel);
}

function updateDiagnostics() {
  if (!debugPanel) return;
  debugPanel.textContent = JSON.stringify({
    loadState, active, ...metrics,
    viewport: [innerWidth, innerHeight],
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    errors,
  }, null, 2);
}

function updateMetrics(next) {
  metrics = next;
  const view = next.view;
  if (view in captions) {
    document.querySelector('#scene-caption').textContent = captions[view];
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  }
  document.querySelector('#zoom-in').disabled = next.zoom >= 3.6;
  document.querySelector('#zoom-out').disabled = next.zoom <= 0.72;
  updateDiagnostics();
}

function loading(isLoading) {
  stage.setAttribute('aria-busy', String(isLoading));
  exploreButton.disabled = isLoading;
  openButton.disabled = isLoading;
  [...viewButtons, ...moodButtons].forEach(button => { button.disabled = isLoading; });
  exploreButton.querySelector('span').textContent = isLoading ? 'ページをひらいています…' : '小さなカフェをめぐる';
}

function endExploration(returnFocus = false) {
  active = false;
  stage.dataset.active = 'false';
  tools.hidden = true;
  help.hidden = true;
  openButton.hidden = false;
  openButton.querySelectorAll('span')[1].textContent = viewer ? 'もう少し眺める' : '3Dで眺める';
  viewer?.setActive(false);
  if (returnFocus) exploreButton.focus({ preventScroll: true });
  updateDiagnostics();
}

function fail(error) {
  actionSerial += 1;
  viewer?.dispose();
  viewer = null;
  loadState = 'error';
  stage.dataset.state = 'poster';
  document.querySelector('#poster').removeAttribute('aria-hidden');
  loading(false);
  endExploration();
  status.textContent = error?.message?.startsWith('3D')
    ? error.message
    : '3Dをひらけませんでした。画像と物語はそのまま楽しめます。「3Dで眺める」からもう一度お試しください。';
  // Keep expected recoverable load failures separate from unhandled runtime errors.
  metrics = { failure: String(error?.message || error) };
  document.documentElement.dataset.mood = 'day';
  moodButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === 'day')));
  document.querySelector('meta[name="theme-color"]').content = '#f6f2e9';
  updateDiagnostics();
}

async function ensureViewer() {
  if (viewer) return viewer;
  if (pending) return pending;
  loadState = 'loading';
  loading(true);
  status.textContent = '絵本をひらいています。もう少しだけ、お待ちください。';
  updateDiagnostics();
  pending = (async () => {
    const { createCafeViewer } = await import('./viewer.js');
    const result = await createCafeViewer({
      mount: document.querySelector('#canvas-mount'), onChange: updateMetrics, onError: fail,
    });
    viewer = result;
    loadState = 'ready';
    stage.dataset.state = 'live';
    document.querySelector('#poster').setAttribute('aria-hidden', 'true');
    loading(false);
    status.textContent = '';
    updateDiagnostics();
    return result;
  })();
  try {
    return await pending;
  } catch (error) {
    fail(error);
    throw error;
  } finally {
    pending = null;
  }
}

async function explore({ view, mood, focus = false, scroll = false } = {}) {
  const serial = ++actionSerial;
  try {
    const result = await ensureViewer();
    if (serial !== actionSerial) return;
    active = true;
    stage.dataset.active = 'true';
    tools.hidden = false;
    help.hidden = false;
    openButton.hidden = true;
    result.setActive(true);
    if (view) result.setView(view);
    if (mood) {
      result.setMood(mood);
      document.documentElement.dataset.mood = mood;
      document.querySelector('meta[name="theme-color"]').content = mood === 'evening' ? '#eae3d8' : '#f6f2e9';
      moodButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === mood)));
    }
    if (scroll) stage.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
    if (focus) result.focus();
    updateDiagnostics();
  } catch {
    // ensureViewer owns the visible, retryable failure state.
  }
}

exploreButton.addEventListener('click', () => explore({ focus: true, scroll: innerWidth < 901 }));
openButton.addEventListener('click', () => explore({ focus: true }));
viewButtons.forEach(button => button.addEventListener('click', () => explore({ view: button.dataset.view })));
moodButtons.forEach(button => button.addEventListener('click', () => explore({ mood: button.dataset.mood })));
document.querySelector('#zoom-in').addEventListener('click', () => viewer?.zoom(1.18));
document.querySelector('#zoom-out').addEventListener('click', () => viewer?.zoom(1 / 1.18));
document.querySelector('#reset-view').addEventListener('click', () => viewer?.setView('overview'));
document.querySelector('#exit-explore').addEventListener('click', () => endExploration(true));
stage.addEventListener('cup-exit', () => endExploration(true));
window.addEventListener('error', event => { errors.push(event.message); updateDiagnostics(); });
window.addEventListener('unhandledrejection', event => { errors.push(String(event.reason)); updateDiagnostics(); });
window.addEventListener('resize', updateDiagnostics);
window.addEventListener('pagehide', () => viewer?.setActive(false));
updateDiagnostics();
