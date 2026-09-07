'use strict';

const routes = {
  riverside: {
    label: 'RIVERSIDE', map: 'RIVERSIDE LOOP', japanese: 'リバーサイド',
    title: ['Riverside', 'reset.'], category: 'THE MIDWEEK RESET',
    description: '川沿いの風で、一日をリセット。会話が続くくらいのペースで走り、最後はコーヒーでひと息。',
    distance: '5.0', pace: 'EASY', time: '19:30', day: '毎週水曜', mood: 'EASY DOES IT',
    meeting: 'リバーサイドのコーヒースタンド',
    path: 'M151 253 107 222 137 179 201 157 263 192 310 180 349 130 415 104 444 137 392 177 326 211 260 228 209 207 183 242 151 253', start: [151, 253]
  },
  city: {
    label: 'CITY LOOP', map: 'CITY LIGHTS LOOP', japanese: 'シティループ',
    title: ['City lights,', 'clear mind.'], category: 'THE FRIDAY FEELING',
    description: 'ネオンの先に、知らなかった街の表情。少し長めのループを心地よいリズムで走って、週末のスイッチを入れよう。',
    distance: '8.0', pace: 'STEADY', time: '20:00', day: '毎週金曜', mood: 'FIND YOUR RHYTHM',
    meeting: '街角のレコードショップ前',
    path: 'M137 274 81 236 64 159 104 97 208 62 330 71 407 108 465 192 423 274 329 302 239 268 199 302 137 274', start: [137, 274]
  },
  park: {
    label: 'PARK SIDE', map: 'PARK SIDE CIRCUIT', japanese: 'パークサイド',
    title: ['Small steps,', 'good nights.'], category: 'YOUR FIRST GOOD RUN',
    description: '木々の間を、気ままにひと回り。短い距離だから、走るのが久しぶりでも大丈夫。歩きながらの参加も、このランの楽しみ方。',
    distance: '3.0', pace: 'RELAX', time: '19:00', day: '毎週火曜', mood: 'ONE STEP AT A TIME',
    meeting: '公園のエントランス広場',
    path: 'M199 253 153 213 163 143 220 100 304 93 359 135 382 192 348 242 269 263 199 253', start: [199, 253]
  }
};

const byId = (id) => document.getElementById(id);
let selectedRoute = 'riverside';
const routeButtons = [...document.querySelectorAll('[data-route]')];
const joinDialog = byId('join-dialog');
const menuDialog = byId('menu-dialog');
const menuToggle = document.querySelector('.menu-toggle');
const joinForm = byId('join-form');
const paceLabels = {
  easy: '会話を楽しみながら、ゆっくり',
  steady: '心地よいリズムで、軽やかに',
  first: 'はじめてなので、自分のペースで'
};

function selectRoute(key) {
  const route = routes[key];
  if (!route) return;
  selectedRoute = key;
  routeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.route === key)));
  byId('map-name').textContent = route.map;
  byId('map-mood').textContent = route.mood;
  byId('map-title').textContent = `${route.japanese}のコース概念図`;
  byId('route-category').textContent = route.category;
  byId('route-name').replaceChildren(document.createTextNode(route.title[0] + ' '), document.createElement('br'), document.createTextNode(route.title[1]));
  byId('route-description').textContent = route.description;
  byId('route-distance').textContent = route.distance;
  byId('route-pace').textContent = route.pace;
  byId('route-time').textContent = route.time;
  byId('route-meeting').textContent = `${route.day} · ${route.meeting}`;
  byId('route-path').setAttribute('d', route.path);
  ['route-start', 'route-halo'].forEach((id) => {
    byId(id).setAttribute('cx', String(route.start[0]));
    byId(id).setAttribute('cy', String(route.start[1]));
  });
  byId('route-announcement').textContent = `${route.japanese}を選択しました。${route.distance}キロ、${route.day} ${route.time}。`;
}

function syncScrollLock() {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
}

function showJoinForm() {
  byId('join-form-view').hidden = false;
  byId('join-success').hidden = true;
  joinDialog.setAttribute('aria-labelledby', 'join-title');
  joinDialog.setAttribute('aria-describedby', 'join-notice');
}

function openJoin(key) {
  showJoinForm();
  joinForm.reset();
  byId('join-route').value = routes[key] ? key : selectedRoute;
  if (menuDialog.open) menuDialog.close();
  joinDialog.showModal();
  syncScrollLock();
}

routeButtons.forEach((button) => button.addEventListener('click', () => selectRoute(button.dataset.route)));
document.querySelectorAll('[data-join]').forEach((button) => button.addEventListener('click', () => openJoin(button.dataset.join)));
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => byId(button.dataset.close).close()));

menuToggle.addEventListener('click', () => {
  menuDialog.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
  syncScrollLock();
});
menuDialog.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => menuDialog.close()));

[joinDialog, menuDialog].forEach((dialog) => {
  dialog.addEventListener('close', () => {
    syncScrollLock();
    if (dialog === menuDialog) menuToggle.setAttribute('aria-expanded', 'false');
    if (dialog === joinDialog) joinForm.reset();
  });
  // Keep keyboard navigation within the currently visible sheet or success view.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter((control) => !control.disabled && control.tabIndex >= 0 && control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) return;
    if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  // Only an actual backdrop click closes the sheet; blank space inside does not.
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!joinForm.reportValidity()) return;
  const route = routes[byId('join-route').value];
  const pace = paceLabels[byId('join-pace').value];
  if (!route || !pace) return;
  const nickname = byId('join-name').value.trim();
  // Render optional user text as text, never markup. Nothing is sent or persisted.
  byId('pass-greeting').textContent = nickname ? `${nickname}さんのデモランパスができました。` : 'あなたのデモランパスができました。';
  byId('pass-route').textContent = route.label;
  byId('pass-details').textContent = `${route.day} / ${route.time} / ${route.distance} KM`;
  byId('pass-pace').textContent = pace;
  byId('join-form-view').hidden = true;
  byId('join-success').hidden = false;
  joinDialog.setAttribute('aria-labelledby', 'success-title');
  joinDialog.removeAttribute('aria-describedby');
  joinDialog.scrollTop = 0;
  byId('success-title').focus();
});

byId('restart-join').addEventListener('click', () => {
  showJoinForm();
  byId('join-route').focus();
});

// Keep the mobile action available while browsing, without covering the footer.
const dock = document.querySelector('.mobile-dock');
const hero = document.querySelector('.hero');
const footer = document.querySelector('.site-footer');
let heroVisible = true;
let footerVisible = false;
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      if (entry.target === footer) footerVisible = entry.isIntersecting;
    });
    dock.hidden = heroVisible || footerVisible;
  });
  observer.observe(hero);
  observer.observe(footer);
}

document.querySelectorAll('button[disabled]').forEach((button) => { button.disabled = false; });
