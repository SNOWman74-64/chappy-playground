const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const context = canvas.getContext('2d', { alpha: false });
const audio = $('audio');
const modes = [...document.querySelectorAll('[data-mode]')];
const pathCache = new Map();
const state = {
  data: null, manifest: null, playing: false, starting: false, started: false,
  position: 0, rate: 1, anchor: 0, anchorPosition: 0, frame: -1,
  mode: 'silhouette', soundAvailable: true, audioURL: null, request: 0, startToken: 0,
};
audio.volume = 0.7;

const formatTime = (seconds) => {
  const value = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
};
const frameAt = (seconds) => Math.min(state.data.frames.length - 1, Math.max(0, Math.floor(seconds * state.data.fps + 0.00001)));
const duration = () => Math.max(state.manifest.duration, state.manifest.audioDuration);
function positionNow() {
  if (!state.playing) return state.position;
  return state.soundAvailable ? audio.currentTime : state.anchorPosition + (performance.now() - state.anchor) / 1000 * state.rate;
}
function setMessage(message) { $('message').textContent = message; }
function setStatus(status) {
  document.body.dataset.state = status;
  $('status').textContent = ({ ready: 'READY TO DRAW', playing: 'DRAWING', paused: 'PAUSED', ended: 'COMPLETE', loading: 'PREPARING', error: 'LOAD ERROR' })[status];
}
function setPlayingControls(playing) {
  $('play').setAttribute('aria-label', playing ? '一時停止' : '再生');
  $('play').querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
  $('play').disabled = !state.data || state.starting;
  $('start').disabled = !state.data || state.starting;
}

function drawFrame(index, force = false) {
  if (!state.data || (!force && index === state.frame)) return;
  const d = state.data.frames[index];
  let path = pathCache.get(index);
  if (!path) {
    path = new Path2D(d);
    pathCache.set(index, path);
    if (pathCache.size > 150) pathCache.delete(pathCache.keys().next().value);
  }
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.width / state.data.width;
  const [a, b, c, dScale, e, f] = state.data.transform;
  context.setTransform(a * scale, b * scale, c * scale, dScale * scale, e * scale, f * scale);
  if (state.mode === 'outline') {
    context.strokeStyle = '#000000';
    context.lineWidth = 10;
    context.lineJoin = 'round';
    context.stroke(path);
  } else {
    context.fillStyle = '#000000';
    context.fill(path, 'nonzero');
  }
  state.frame = index;
  canvas.dataset.frame = String(index);
  canvas.dataset.mode = state.mode;
  $('frame-counter').textContent = `${String(index + 1).padStart(4, '0')} / ${state.data.frames.length.toLocaleString('en-US')}`;
}

function updateTimeline(time) {
  const index = frameAt(time);
  $('elapsed').textContent = formatTime(time);
  $('seek').value = String(index);
  $('seek').style.setProperty('--progress', `${index / (state.data.frames.length - 1) * 100}%`);
  $('seek').setAttribute('aria-valuetext', `${Math.floor(time / 60)}分${Math.floor(time % 60)}秒、${index + 1}コマ目`);
}
function resizeCanvas() {
  const rect = $('screen').getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 2)));
  if (canvas.width === width) return;
  canvas.width = width;
  canvas.height = Math.round(width * 3 / 4);
  if (state.data) drawFrame(state.frame < 0 ? 0 : state.frame, true);
}
new ResizeObserver(resizeCanvas).observe($('screen'));

function pause() {
  if (state.data) state.position = Math.min(positionNow(), duration());
  state.startToken += 1;
  state.starting = false;
  state.playing = false;
  audio.pause();
  cancelAnimationFrame(state.request);
  state.request = 0;
  setPlayingControls(false);
  if (state.data) {
    setStatus('paused');
    if (state.started) { drawFrame(frameAt(state.position)); updateTimeline(state.position); }
  }
}

function finish() {
  pause();
  if ($('loop').checked) {
    state.position = 0;
    void play();
    return;
  }
  state.position = duration();
  drawFrame(state.data.frames.length - 1);
  updateTimeline(state.position);
  setStatus('ended');
  $('start-overlay').hidden = false;
  $('start-label').textContent = 'もう一度再生';
  $('preview-label').textContent = '6,572 FRAMES · COMPLETE';
}

function tick() {
  if (!state.playing) return;
  const time = Math.min(positionNow(), duration());
  if (time >= duration() - 0.002) { finish(); return; }
  drawFrame(frameAt(time));
  updateTimeline(time);
  state.request = requestAnimationFrame(tick);
}

function fallBackToSilent() {
  if (!state.soundAvailable) return;
  const time = state.playing ? audio.currentTime : state.position;
  state.soundAvailable = false;
  state.position = time;
  state.anchorPosition = time;
  state.anchor = performance.now();
  audio.pause();
  $('mute').disabled = true;
  $('volume').disabled = true;
  setMessage('音声を読み込めなかったため、無音で再生します。影絵は全編ご覧いただけます。');
}

async function prepareAudio() {
  // A complete Blob stays seekable even on static servers without byte ranges.
  // Do not enable playback until the local audio has loaded or failed safely.
  try {
    const response = await fetch(audio.dataset.src, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('Audio file unavailable');
    const blob = await response.blob();
    state.audioURL = URL.createObjectURL(blob);
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        audio.removeEventListener('canplay', loaded);
        audio.removeEventListener('error', failed);
      };
      const loaded = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error('Audio could not be decoded')); };
      const timer = setTimeout(failed, 10000);
      audio.addEventListener('canplay', loaded, { once: true });
      audio.addEventListener('error', failed, { once: true });
      audio.src = state.audioURL;
      audio.load();
    });
  } catch {
    fallBackToSilent();
    if (state.audioURL) {
      URL.revokeObjectURL(state.audioURL);
      state.audioURL = null;
    }
  }
}

async function play() {
  if (!state.data || state.playing || state.starting) return;
  if (state.position >= duration() - 0.01) state.position = 0;
  const token = ++state.startToken;
  state.starting = true;
  setPlayingControls(false);
  try {
    if (state.soundAvailable) {
      audio.currentTime = state.position;
      audio.playbackRate = state.rate;
      await audio.play();
    }
  } catch (error) {
    if (token !== state.startToken) return;
    if (error.name === 'NotAllowedError') {
      state.starting = false;
      setPlayingControls(false);
      setMessage('ブラウザが音声を停止しました。再生ボタンをもう一度押してください。');
      return;
    }
    fallBackToSilent();
  }
  if (token !== state.startToken) return;
  state.started = true;
  state.starting = false;
  state.playing = true;
  state.anchorPosition = state.position;
  state.anchor = performance.now();
  $('start-overlay').hidden = true;
  setStatus('playing');
  setPlayingControls(true);
  if (state.soundAvailable) setMessage('音声に同期して、毎秒30コマの輪郭を描画しています。');
  tick();
}
function togglePlayback() { if (state.playing || state.starting) pause(); else void play(); }

function seekToFrame(index) {
  if (!state.data) return;
  state.started = true;
  $('start-overlay').hidden = true;
  const frame = Math.max(0, Math.min(state.data.frames.length - 1, Math.round(index)));
  state.position = frame / state.data.fps;
  state.anchorPosition = state.position;
  state.anchor = performance.now();
  if (state.soundAvailable) audio.currentTime = state.position;
  drawFrame(frame);
  updateTimeline(state.position);
  if (!state.playing) setStatus('paused');
}
function stepFrame(amount) {
  if (!state.data) return;
  const index = state.started ? frameAt(positionNow()) : state.manifest.posterFrame;
  pause();
  seekToFrame(index + amount);
}
function updateVolume() {
  const muted = audio.muted || audio.volume === 0;
  $('mute').setAttribute('aria-label', muted ? '消音を解除' : '消音');
  $('mute').setAttribute('aria-pressed', String(muted));
  $('mute').querySelector('use').setAttribute('href', muted ? '#i-muted' : '#i-volume');
  $('volume').style.setProperty('--progress', `${(muted ? 0 : audio.volume) * 100}%`);
}
function toggleMute() { audio.muted = !(audio.muted || audio.volume === 0); if (!audio.muted && audio.volume === 0) { audio.volume = 0.7; $('volume').value = '0.7'; } updateVolume(); }

function syncFullscreen() {
  const active = Boolean(document.fullscreenElement) || $('player').classList.contains('theater');
  $('fullscreen').setAttribute('aria-label', active ? '全画面表示を終了' : '全画面表示');
  $('fullscreen').setAttribute('aria-pressed', String(active));
  resizeCanvas();
}
function exitTheater() { $('player').classList.remove('theater'); document.body.classList.remove('theater-open'); syncFullscreen(); }
async function leaveFullscreen() {
  exitTheater();
  if (!document.fullscreenElement) return;
  try {
    await document.exitFullscreen();
  } catch {
    // Native Escape can complete the exit before this request is processed.
    syncFullscreen();
  }
}
async function toggleFullscreen() {
  if (document.fullscreenElement || $('player').classList.contains('theater')) { await leaveFullscreen(); return; }
  try {
    if (!$('player').requestFullscreen) throw new Error('Fullscreen unsupported');
    await $('player').requestFullscreen();
  } catch {
    $('player').classList.add('theater');
    document.body.classList.add('theater-open');
    syncFullscreen();
  }
}

$('start').addEventListener('click', () => void play());
$('play').addEventListener('click', togglePlayback);
$('restart').addEventListener('click', () => { pause(); seekToFrame(0); void play(); });
$('previous-frame').addEventListener('click', () => stepFrame(-1));
$('next-frame').addEventListener('click', () => stepFrame(1));
// Native range input retains pointer, touch, and keyboard behavior. Scrubbing
// pauses until an explicit play, so the playhead cannot fight a dragging thumb.
$('seek').addEventListener('input', () => { const index = Number($('seek').value); pause(); seekToFrame(index); });
$('speed').addEventListener('change', () => {
  state.position = positionNow();
  state.anchorPosition = state.position;
  state.anchor = performance.now();
  state.rate = Number($('speed').value);
  audio.playbackRate = state.rate;
});
$('mute').addEventListener('click', toggleMute);
$('volume').addEventListener('input', () => { audio.volume = Number($('volume').value); audio.muted = false; updateVolume(); });
$('fullscreen').addEventListener('click', () => void toggleFullscreen());
document.addEventListener('fullscreenchange', syncFullscreen);
audio.addEventListener('ended', () => { if (state.playing) finish(); });
audio.addEventListener('error', fallBackToSilent);
modes.forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.mode;
  modes.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  if (state.data) drawFrame(state.frame, true);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { void leaveFullscreen(); return; }
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.target.closest('input,select,textarea,button,a,summary,[contenteditable="true"]')) return;
  const action = ({ ' ': togglePlayback, ArrowLeft: () => stepFrame(-1), ArrowRight: () => stepFrame(1), m: toggleMute,
    f: () => void toggleFullscreen(), r: () => { pause(); seekToFrame(0); void play(); } })[event.key];
  if (action) { event.preventDefault(); action(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && (state.playing || state.starting)) pause(); });
window.addEventListener('pagehide', (event) => {
  pause();
  if (!event.persisted && state.audioURL) URL.revokeObjectURL(state.audioURL);
});

async function loadData() {
  $('retry').hidden = true;
  setStatus('loading');
  setMessage('影絵と音声を読み込んでいます。');
  try {
    if (!context || !('Path2D' in window) || !('DecompressionStream' in window)) {
      throw new Error('このブラウザは描画方式に対応していません。新しいChrome・Safari・Firefoxでお試しください。');
    }
    const [manifestResponse, framesResponse] = await Promise.all([fetch('./assets/manifest.json'), fetch('./assets/frames.json.gz')]);
    if (!manifestResponse.ok || !framesResponse.ok) throw new Error('描画ファイルが見つかりません。HTTPサーバーから開いてください。');
    const [manifest, data] = await Promise.all([
      manifestResponse.json(),
      new Response(framesResponse.body.pipeThrough(new DecompressionStream('gzip'))).json(),
    ]);
    if (data.version !== 1 || data.fps !== 30 || data.frames.length !== manifest.frameCount || !data.frames.every((frame) => typeof frame === 'string')) {
      throw new Error('描画データが完全ではありません。読み込みをやり直してください。');
    }
    await audioReady;
    state.manifest = manifest;
    state.data = data;
    $('duration').textContent = formatTime(duration());
    $('seek').max = String(data.frames.length - 1);
    $('frame-total').textContent = data.frames.length.toLocaleString('en-US');
    ['play', 'start', 'restart', 'seek', 'previous-frame', 'next-frame'].forEach((id) => { $(id).disabled = false; });
    $('start-label').textContent = '再生する';
    resizeCanvas();
    drawFrame(manifest.posterFrame, true);
    document.body.dataset.ready = 'true';
    setStatus('ready');
    if (state.soundAvailable) setMessage('再生すると音が流れます。白黒がすばやく切り替わる場面があります。');
  } catch (error) {
    setStatus('error');
    setMessage(`読み込みに失敗しました。${error.message}`);
    $('start-label').textContent = '読み込みに失敗しました';
    $('retry').hidden = false;
  }
}
$('retry').addEventListener('click', () => void loadData());
const audioReady = prepareAudio();
void loadData();
