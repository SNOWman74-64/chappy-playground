'use strict';
(() => {
  // Additive detail viewer. The original renderer, brewing and storage stay intact.
  const scene = document.querySelector('#scene');
  const sceneTools = document.querySelector('.scene-tools');
  if (!scene || !sceneTools || scene.querySelector('.explore-layer')) return;
  const layer = document.createElement('div');
  layer.className = 'explore-layer';
  for (const selector of ['#fallback', '#cafe', '.scene-shadow', '.hotspots']) {
    const node = scene.querySelector(selector);
    if (node) layer.appendChild(node);
  }
  scene.prepend(layer);
  scene.classList.add('explore-ready');
  scene.setAttribute('aria-label', '紙のカフェ。全体表示では1本指で回転。拡大中は1本指で移動、2本指で拡大縮小。下のボタンでも操作できます。');

  const controls = document.createElement('div');
  controls.className = 'explore-controls';
  controls.innerHTML = `<div class="explore-zoom" role="group" aria-label="拡大縮小">
    <button type="button" data-zoom="-1" aria-label="縮小する">−</button>
    <output aria-label="表示倍率">1.0×</output>
    <button type="button" data-zoom="1" aria-label="拡大する">＋</button>
    <button type="button" data-focus="all" aria-pressed="true">全体に戻る</button>
    </div><div class="explore-presets" role="group" aria-label="内装を拡大して見る">
    <button type="button" data-focus="window" aria-pressed="false">窓辺</button>
    <button type="button" data-focus="counter" aria-pressed="false">カウンター</button>
    <button type="button" data-focus="table" aria-pressed="false">テーブル</button>
    <button type="button" data-focus="plant" aria-pressed="false">植物</button>
    </div><p class="explore-note">2本指で拡大・移動 · ダブルタップで拡大／全体へ</p>`;
  sceneTools.after(controls);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const state = { scale: 1, x: 0, y: 0, focus: 'all', mode: '', points: new Map() };
  // These are broad display regions, not 3D raycast destinations.
  const presets = {
    window: { scale: 2, x: .33, y: .35 },
    counter: { scale: 1.85, x: .60, y: .43 },
    table: { scale: 2.1, x: .40, y: .66 },
    plant: { scale: 2.1, x: .78, y: .62 }
  };
  let gesture = null, lastTap = null, bridge = false, suppressClickUntil = 0;
  let frame = 0;
  const box = () => scene.getBoundingClientRect();
  function maxZoom() {
    const r = box(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Match the original renderer's DPR cap; limit the expanded drawing buffer.
    return Math.max(1, Math.min(2.6, Math.sqrt(4000000 / Math.max(1, r.width * r.height * dpr * dpr)), 4096 / Math.max(1, r.width * dpr, r.height * dpr)));
  }
  function constrain() {
    state.scale = clamp(state.scale, 1, maxZoom());
    const limit = (state.scale - 1) * 50;
    state.x = clamp(state.x, -limit, limit);
    state.y = clamp(state.y, -limit, limit);
    if (state.scale < 1.015) { state.scale = 1; state.x = state.y = 0; state.focus = 'all'; }
  }
  function render() {
    frame = 0;
    constrain();
    // Resize the viewport instead of CSS-scaling its pixels. ResizeObserver in
    // app.js redraws at this size; hotspot buttons keep their 44px touch targets.
    layer.style.width = `${state.scale * 100}%`;
    layer.style.height = `${state.scale * 100}%`;
    layer.style.left = `${(1 - state.scale) * 50 + state.x}%`;
    layer.style.top = `${(1 - state.scale) * 50 + state.y}%`;
    scene.classList.toggle('is-exploring', state.scale > 1);
    controls.querySelector('output').value = `${state.scale.toFixed(1)}×`;
    for (const button of controls.querySelectorAll('[data-focus]')) button.setAttribute('aria-pressed', String(button.dataset.focus === state.focus));
    controls.querySelector('[data-zoom="-1"]').disabled = state.scale <= 1;
    controls.querySelector('[data-zoom="1"]').disabled = state.scale >= maxZoom() - .001;
    const hint = document.querySelector('#hint');
    if (hint) hint.textContent = state.scale > 1 ? '1本指で移動 · 左右の矢印で回転' : scene.classList.contains('ready') ? '1本指で回転 · 2本指で拡大' : '展示モード · 2本指で拡大できます';
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function local(p) { const r = box(); return { x: ((p.x - r.left) / Math.max(1, r.width) - .5) * 100, y: ((p.y - r.top) / Math.max(1, r.height) - .5) * 100 }; }
  function zoomTo(value, anchor = { x: 0, y: 0 }) {
    const next = clamp(value, 1, maxZoom()), ratio = next / state.scale;
    state.x = anchor.x - (anchor.x - state.x) * ratio;
    state.y = anchor.y - (anchor.y - state.y) * ratio;
    state.scale = next; state.focus = ''; render();
  }
  function focus(name) {
    if (name === 'all') { state.scale = 1; state.x = state.y = 0; }
    else if (Object.hasOwn(presets, name)) {
      const p = presets[name]; state.scale = Math.min(p.scale, maxZoom());
      state.x = (.5 - p.x) * state.scale * 100;
      state.y = (.5 - p.y) * state.scale * 100;
    } else return;
    state.focus = name; lastTap = null; render();
  }
  controls.addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.focus) focus(b.dataset.focus);
    else if (b.dataset.zoom) zoomTo(state.scale * (Number(b.dataset.zoom) > 0 ? 1.2 : 1 / 1.2));
  });
  // The v1 renderer owns a one-pointer rotation. Cancel that owner when a second
  // finger arrives. A zero-delta move clears its release velocity before cancel.
  function cancelRotation(point) {
    if (state.mode !== 'rotate' || !point) return;
    bridge = true;
    try {
      const init = { pointerId: point.id, pointerType: point.type, clientX: point.x, clientY: point.y, isPrimary: true };
      scene.dispatchEvent(new PointerEvent('pointermove', init));
      scene.dispatchEvent(new PointerEvent('pointercancel', init));
    } finally { bridge = false; }
  }
  function rebase() {
    const points = [...state.points.values()];
    if (!points.length) { gesture = null; state.mode = ''; return; }
    if (points.length > 1) {
      const [a, b] = points;
      gesture = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), center: local({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }), scale: state.scale, x: state.x, y: state.y };
      state.mode = 'pinch';
    } else {
      gesture = { start: local(points[0]), x: state.x, y: state.y };
      state.mode = 'pan';
    }
  }
  function stopEvent(event) { if (event.cancelable) event.preventDefault(); event.stopImmediatePropagation(); }
  scene.addEventListener('pointerdown', event => {
    if (bridge || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (!state.points.size && event.target.closest('button')) return;
    const first = [...state.points.values()][0];
    const point = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, at: performance.now(), moved: false, multi: !!first };
    if (first) {
      cancelRotation(first);
      for (const p of state.points.values()) p.multi = true;
      lastTap = null; suppressClickUntil = performance.now() + 450;
    }
    state.points.set(point.id, point);
    if (state.points.size === 1 && state.scale === 1) { state.mode = 'rotate'; return; }
    rebase(); stopEvent(event);
    try { scene.setPointerCapture(event.pointerId); } catch { /* Pointer may have been cancelled by the OS. */ }
  }, true);
  scene.addEventListener('pointermove', event => {
    if (bridge) return;
    const p = state.points.get(event.pointerId); if (!p) return;
    p.x = event.clientX; p.y = event.clientY;
    p.moved ||= Math.hypot(p.x - p.startX, p.y - p.startY) > 8;
    if (state.mode === 'rotate') return;
    stopEvent(event);
    const points = [...state.points.values()];
    if (state.mode === 'pinch' && points.length > 1) {
      const [a, b] = points, center = local({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const scale = clamp(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, 1, maxZoom()), ratio = scale / gesture.scale;
      state.x = center.x - (gesture.center.x - gesture.x) * ratio;
      state.y = center.y - (gesture.center.y - gesture.y) * ratio;
      state.scale = scale;
    } else if (gesture) {
      const at = local(p); state.x = gesture.x + at.x - gesture.start.x; state.y = gesture.y + at.y - gesture.start.y;
    }
    state.focus = ''; constrain(); schedule();
  }, true);
  function release(event) {
    if (bridge) return;
    const p = state.points.get(event.pointerId); if (!p) return;
    const handled = state.mode !== 'rotate', now = performance.now();
    state.points.delete(event.pointerId);
    if (handled) stopEvent(event);
    const tapped = event.type === 'pointerup' && !p.moved && !p.multi && now - p.at < 300 && p.type === 'touch';
    if (tapped) {
      if (lastTap && now - lastTap.at < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 28) {
        if (state.scale > 1.2) focus('all'); else zoomTo(1.9, local(p));
        lastTap = null; suppressClickUntil = now + 450;
      } else lastTap = { at: now, x: p.x, y: p.y };
    } else lastTap = null;
    if (p.multi || p.moved) suppressClickUntil = now + 450;
    if (state.points.size) rebase(); else { gesture = null; state.mode = ''; }
    render();
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) scene.addEventListener(type, release, true);
  scene.addEventListener('click', event => { if (performance.now() < suppressClickUntil) stopEvent(event); }, true);
  function clearGesture() {
    cancelRotation([...state.points.values()][0]);
    const ids = [...state.points.keys()]; state.points.clear(); gesture = null; state.mode = ''; lastTap = null;
    for (const id of ids) { try { if (scene.hasPointerCapture(id)) scene.releasePointerCapture(id); } catch {} }
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }
  window.addEventListener('blur', clearGesture);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearGesture(); else render(); });
  window.addEventListener('resize', () => { clearGesture(); render(); });
  scene.addEventListener('keydown', event => {
    if (event.target !== scene) return;
    if (['+', '=', '-', '0', 'Escape'].includes(event.key)) {
      event.preventDefault();
      if (event.key === '0' || event.key === 'Escape') focus('all');
      else zoomTo(state.scale * (event.key === '-' ? 1 / 1.2 : 1.2));
    }
  });
  scene.addEventListener('focusin', event => {
    if (state.scale > 1 && event.target.matches('button:focus-visible')) focus('all');
  });
  // Keep the fallback copy in sync with WebGL loss/restoration without touching state.
  let ready = scene.classList.contains('ready');
  new MutationObserver(() => { const next = scene.classList.contains('ready'); if (next !== ready) { ready = next; render(); } }).observe(scene, { attributes: true, attributeFilter: ['class'] });
  window.PaperMoonExplore = Object.freeze({ diagnostics: () => ({ version: '2.1', kind: 'detail-view', scale: state.scale, pan: [state.x, state.y], focus: state.focus, pointers: state.points.size, gesture: state.mode }) });
  render();
})();
