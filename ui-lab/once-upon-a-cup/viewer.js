import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const SHOTS = {
  overview: { position: [11, 13, 17], target: [0, 1.55, 0], zoom: 1 },
  terrace: { position: [2.6, 6.1, 10.8], target: [-2.65, 1.2, 2.1], zoom: 2.4 },
  patisserie: { position: [9.2, 6.9, 9.3], target: [2.6, 1.25, -0.4], zoom: 2.5 },
};

/** The renderer is created only after an explicit visitor action. */
export async function createCafeViewer({ mount, onChange, onError }) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', '絵本のカフェの3Dモデル。矢印キーで回転、プラスとマイナスで拡大縮小、Homeで全景、Escapeで操作終了。');
  canvas.setAttribute('aria-describedby', 'viewer-help');
  mount.replaceChildren(canvas);

  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 100);
  camera.position.fromArray(SHOTS.overview.position);
  const controls = new OrbitControls(camera, canvas);
  controls.target.fromArray(SHOTS.overview.target);
  controls.enablePan = false;
  controls.enableDamping = !reducedMotion.matches;
  controls.dampingFactor = 0.12;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.75;
  controls.minZoom = 0.72;
  controls.maxZoom = 3.6;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.enabled = false;
  canvas.style.touchAction = 'pan-y';
  controls.update();

  const hemisphere = new THREE.HemisphereLight(0xfff3dd, 0x8c9b88, 2.3);
  const key = new THREE.DirectionalLight(0xffedda, 3.1);
  key.position.set(-5, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(innerWidth < 600 ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 10, bottom: -8, near: 0.5, far: 40 });
  key.shadow.normalBias = 0.022;
  key.shadow.bias = -0.00015;
  const fill = new THREE.DirectionalLight(0xdce9ef, 1.05);
  fill.position.set(8, 9, 1);
  const rim = new THREE.DirectionalLight(0xfff2dd, 0.8);
  rim.position.set(0, 11, -7);
  scene.add(hemisphere, key, fill, rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(23, 20), new THREE.ShadowMaterial({ color: 0x4f5649, opacity: 0.17 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.115;
  floor.receiveShadow = true;
  scene.add(floor);

  let disposed = false;
  let ready = false;
  let intersecting = true;
  let frameId = 0;
  let frameCount = 0;
  let tween = null;
  let model = null;
  let currentView = 'overview';
  let currentMood = 'day';
  let modelTriangles = 0;
  let modelMeshes = 0;
  let lastRenderMs = 0;
  const loadStart = performance.now();
  let loadMs = 0;
  const windowMaterials = [];

  function snapshot() {
    return {
      ready, active: controls.enabled, view: currentView, mood: currentMood,
      modelMeshes, modelTriangles, drawCalls: renderer.info.render.calls,
      renderedTriangles: renderer.info.render.triangles, frames: frameCount,
      lastRenderMs: +lastRenderMs.toFixed(2), loadMs: Math.round(loadMs),
      pixelRatio: renderer.getPixelRatio(), zoom: +camera.zoom.toFixed(3),
      camera: camera.position.toArray().map(n => +n.toFixed(3)),
      target: controls.target.toArray().map(n => +n.toFixed(3)),
      reducedMotion: reducedMotion.matches,
      suspended: document.hidden || !intersecting,
    };
  }

  function requestRender() {
    if (!disposed && ready && !frameId && !document.hidden && intersecting) {
      frameId = requestAnimationFrame(render);
    }
  }

  function render(now) {
    frameId = 0;
    if (disposed || !ready || document.hidden || !intersecting) return;
    if (tween) {
      const progress = Math.min(1, (now - tween.started) / 650);
      const ease = 1 - (1 - progress) ** 3;
      camera.position.lerpVectors(tween.fromPosition, tween.position, ease);
      controls.target.lerpVectors(tween.fromTarget, tween.target, ease);
      camera.zoom = THREE.MathUtils.lerp(tween.fromZoom, tween.zoom, ease);
      camera.updateProjectionMatrix();
      if (progress === 1) tween = null;
    }
    controls.update();
    const before = performance.now();
    renderer.render(scene, camera);
    lastRenderMs = performance.now() - before; // CPU submission time, not a GPU benchmark.
    frameCount += 1;
    onChange(snapshot());
    if (tween) requestRender();
  }

  function resize() {
    if (disposed) return;
    const { width, height } = mount.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    const aspect = width / height;
    const verticalSpan = Math.max(11.4, 15.8 / aspect);
    camera.left = -verticalSpan * aspect / 2;
    camera.right = verticalSpan * aspect / 2;
    camera.top = verticalSpan / 2;
    camera.bottom = -verticalSpan / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(Math.round(width), Math.round(height), false);
    requestRender();
  }

  function setView(name, animate = true) {
    const shot = SHOTS[name];
    if (!shot || disposed) return;
    currentView = name;
    // Clear leftover drag inertia before a deliberate camera transition.
    controls.enableDamping = false;
    controls.update();
    controls.enableDamping = !reducedMotion.matches;
    const position = new THREE.Vector3().fromArray(shot.position);
    const target = new THREE.Vector3().fromArray(shot.target);
    if (animate && !reducedMotion.matches) {
      tween = {
        started: performance.now(), fromPosition: camera.position.clone(), position,
        fromTarget: controls.target.clone(), target, fromZoom: camera.zoom, zoom: shot.zoom,
      };
    } else {
      tween = null;
      camera.position.copy(position);
      controls.target.copy(target);
      camera.zoom = shot.zoom;
      camera.updateProjectionMatrix();
      controls.update();
    }
    requestRender();
  }

  function setMood(mood) {
    const evening = mood === 'evening';
    currentMood = evening ? 'evening' : 'day';
    hemisphere.color.set(evening ? 0xffd2b5 : 0xfff3dd);
    hemisphere.groundColor.set(evening ? 0x646974 : 0x8c9b88);
    hemisphere.intensity = evening ? 1.45 : 2.3;
    key.color.set(evening ? 0xffb883 : 0xffedda);
    key.intensity = evening ? 2.25 : 3.1;
    fill.color.set(evening ? 0xa8b5df : 0xdce9ef);
    fill.intensity = evening ? 0.65 : 1.05;
    rim.intensity = evening ? 1.15 : 0.8;
    renderer.toneMappingExposure = evening ? 0.86 : 1.05;
    for (const material of windowMaterials) {
      material.emissive.set(evening ? 0xfbb06b : 0x000000);
      material.emissiveIntensity = evening ? 0.45 : 0;
    }
    requestRender();
  }

  function setActive(active) {
    controls.enabled = active;
    canvas.tabIndex = active ? 0 : -1;
    canvas.style.touchAction = active ? 'none' : 'pan-y';
    if (!active) tween = null;
    onChange(snapshot());
  }

  function zoom(factor) {
    tween = null;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
    requestRender();
  }

  function keyboard(event) {
    if (!controls.enabled) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      tween = null;
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key === 'ArrowLeft') spherical.theta -= 0.1;
      if (event.key === 'ArrowRight') spherical.theta += 0.1;
      if (event.key === 'ArrowUp') spherical.phi -= 0.08;
      if (event.key === 'ArrowDown') spherical.phi += 0.08;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
      requestRender();
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault(); zoom(1.18);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault(); zoom(1 / 1.18);
    } else if (event.key === 'Home') {
      event.preventDefault(); setView('overview');
    } else if (event.key === 'Escape') {
      event.preventDefault(); canvas.dispatchEvent(new CustomEvent('cup-exit', { bubbles: true }));
    }
  }

  function visibility() {
    if (ready && !disposed) onChange(snapshot());
    requestRender();
  }
  function motionChanged() {
    controls.enableDamping = !reducedMotion.matches;
    if (reducedMotion.matches && tween) setView(currentView, false);
    requestRender();
  }
  function contextLost(event) {
    event.preventDefault();
    if (!disposed) onError(new Error('3Dの描画が中断されました。もう一度ひらくことができます。'));
  }
  function disposeObject(root) {
    const geometries = new Set();
    const materials = new Set();
    root.traverse(obj => {
      if (obj.geometry) geometries.add(obj.geometry);
      for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) {
        if (material) materials.add(material);
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  const intersectionObserver = new IntersectionObserver(entries => {
    intersecting = entries[0].isIntersecting;
    if (ready && !disposed) onChange(snapshot());
    requestRender();
  });
  intersectionObserver.observe(mount);
  controls.addEventListener('change', requestRender);
  controls.addEventListener('start', () => { tween = null; });
  canvas.addEventListener('keydown', keyboard);
  canvas.addEventListener('webglcontextlost', contextLost);
  document.addEventListener('visibilitychange', visibility);
  reducedMotion.addEventListener('change', motionChanged);

  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('./vendor/draco/', import.meta.url).href);
  draco.setDecoderConfig({ type: 'wasm' });
  draco.setWorkerLimit(2);
  const loader = new GLTFLoader().setDRACOLoader(draco);

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    reducedMotion.removeEventListener('change', motionChanged);
    canvas.removeEventListener('keydown', keyboard);
    canvas.removeEventListener('webglcontextlost', contextLost);
    controls.dispose();
    draco.dispose();
    disposeObject(scene);
    key.shadow.dispose();
    renderer.dispose();
    canvas.remove();
  }

  let timeout;
  try {
    const assetPromise = loader.loadAsync(new URL('./assets/cafe.glb', import.meta.url).href).then(asset => {
      if (disposed) {
        disposeObject(asset.scene);
        throw new Error('Viewer was disposed during loading');
      }
      return asset;
    });
    const asset = await Promise.race([
      assetPromise,
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('3Dの読み込みに時間がかかっています。接続を確認して、もう一度お試しください。')), 25000); }),
    ]);
    model = asset.scene;
    model.traverse(obj => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      modelMeshes += 1;
      modelTriangles += (obj.geometry.index?.count ?? obj.geometry.attributes.position.count) / 3;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of materials) {
        if (material.name === 'Midnight blue window') windowMaterials.push(material);
      }
    });
    scene.add(model);
    renderer.shadowMap.needsUpdate = true;
    ready = true;
    loadMs = performance.now() - loadStart;
    resize();
    setView('overview', false);
    // Resolve only after the first actual frame, preventing a blank poster handoff.
    if (!document.hidden && intersecting) render(performance.now());
    draco.dispose();
    return { setView, setMood, setActive, zoom, dispose, snapshot, focus: () => canvas.focus({ preventScroll: true }) };
  } catch (error) {
    dispose();
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
