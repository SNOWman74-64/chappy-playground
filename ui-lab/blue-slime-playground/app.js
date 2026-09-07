import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const stage = document.querySelector('#stage');
const mount = document.querySelector('#canvas-mount');
const playground = document.querySelector('#playground');
const fallbackMessage = document.querySelector('#fallback-message');
const liveStatus = document.querySelector('#live-status');
const resetButton = document.querySelector('#reset');
const jumpButton = document.querySelector('#jump');

const BASE_Y = 0.54;
const MAX_DPR = 1.65;
const MAX_PIXELS = 4_000_000;
const clock = new THREE.Clock();

let renderer;
let scene;
let camera;
let controls;
let slimeRoot;
let slimeMesh;
let faceMesh;
let positionAttr;
let restPositions;
let velocities;
let accelerations;
let adjacency;
let faceVertexIds = [];
let animationFrame = 0;
let initialCamera = null;
let initialTarget = null;
let rootVelocity = new THREE.Vector3();
let rootVerticalVelocity = 0;
let grounded = true;
let movementPulse = 0;

const keys = new Set();
const virtualDirections = new Set();
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const tempWorld = new THREE.Vector3();
const tempLocal = new THREE.Vector3();
const tempA = new THREE.Vector3();
const tempB = new THREE.Vector3();
const tempForward = new THREE.Vector3();
const tempRight = new THREE.Vector3();
const tempMove = new THREE.Vector3();

const grab = {
  active: false,
  pointerId: null,
  localPoint: new THREE.Vector3(),
  localTarget: new THREE.Vector3(),
  delta: new THREE.Vector3(),
  lastTargetWorld: new THREE.Vector3(),
  pointerVelocityWorld: new THREE.Vector3(),
  lastMoveTime: 0,
  weights: null,
};

function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#cba77d');
  gradient.addColorStop(0.5, '#b98e62');
  gradient.addColorStop(1, '#d2b38d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  for (let i = 0; i < 70; i += 1) {
    const y = (i / 70) * canvas.height;
    const phase = Math.sin(i * 1.618) * 42;
    ctx.beginPath();
    for (let x = -20; x <= canvas.width + 20; x += 18) {
      const wave = Math.sin(x * 0.022 + i * 0.57) * (5 + (i % 5));
      const yy = y + wave + phase * 0.08;
      if (x === -20) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = `rgba(87, 54, 30, ${0.035 + (i % 7) * 0.006})`;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 3.2);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const drawEye = (x) => {
    ctx.save();
    ctx.translate(x, 142);
    ctx.scale(1, 1.2);
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fillStyle = '#102858';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-13, -13, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  };

  drawEye(190);
  drawEye(410);

  ctx.beginPath();
  ctx.moveTo(247, 244);
  ctx.bezierCurveTo(272, 271, 329, 271, 353, 242);
  ctx.bezierCurveTo(349, 306, 250, 310, 247, 244);
  ctx.fillStyle = '#102858';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(300, 285, 38, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ff8fa8';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function buildSlimeGeometry() {
  const source = new THREE.SphereGeometry(1, 44, 30);
  source.deleteAttribute('uv');
  source.deleteAttribute('normal');
  const geometry = mergeVertices(source, 1e-4);
  const pos = geometry.getAttribute('position');

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = (y + 1) * 0.5;
    const top = THREE.MathUtils.smoothstep(y, 0.3, 1);
    const radial = 0.83 + (1 - t) * 0.2 + Math.sin(t * Math.PI) * 0.06 - top * 0.18;

    let px = x * radial * 0.86;
    let py = y * 0.67 + top * 0.24;
    let pz = z * radial * 0.86;

    if (py < -0.51) py = -0.51 + (py + 0.51) * 0.17;
    const baseSpread = THREE.MathUtils.smoothstep(-py, 0.32, 0.51);
    px *= 1 + baseSpread * 0.08;
    pz *= 1 + baseSpread * 0.08;

    pos.setXYZ(i, px, py, pz);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.boundingSphere.radius = 1.55;
  return geometry;
}

function buildAdjacency(geometry) {
  const count = geometry.getAttribute('position').count;
  const sets = Array.from({ length: count }, () => new Set());
  const index = geometry.index.array;
  for (let i = 0; i < index.length; i += 3) {
    const a = index[i];
    const b = index[i + 1];
    const c = index[i + 2];
    sets[a].add(b); sets[a].add(c);
    sets[b].add(a); sets[b].add(c);
    sets[c].add(a); sets[c].add(b);
  }
  return sets.map((set) => [...set]);
}

function createSlime() {
  slimeRoot = new THREE.Group();
  slimeRoot.position.set(0, BASE_Y, 0);
  scene.add(slimeRoot);

  const geometry = buildSlimeGeometry();
  positionAttr = geometry.getAttribute('position');
  restPositions = new Float32Array(positionAttr.array);
  velocities = new Float32Array(positionAttr.count * 3);
  accelerations = new Float32Array(positionAttr.count * 3);
  adjacency = buildAdjacency(geometry);

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1d82ff'),
    roughness: 0.16,
    metalness: 0,
    transmission: 0.72,
    thickness: 0.85,
    ior: 1.34,
    attenuationColor: new THREE.Color('#1269df'),
    attenuationDistance: 1.85,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    specularIntensity: 1,
    side: THREE.DoubleSide,
  });

  slimeMesh = new THREE.Mesh(geometry, material);
  slimeMesh.castShadow = true;
  slimeMesh.receiveShadow = true;
  slimeMesh.renderOrder = 1;
  slimeRoot.add(slimeMesh);

  const faceTexture = createFaceTexture();
  const faceMaterial = new THREE.MeshBasicMaterial({
    map: faceTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    side: THREE.FrontSide,
  });
  faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.03, 0.65), faceMaterial);
  faceMesh.position.set(0, 0.05, 0.76);
  faceMesh.renderOrder = 3;
  slimeRoot.add(faceMesh);

  for (let i = 0; i < positionAttr.count; i += 1) {
    const i3 = i * 3;
    const x = restPositions[i3];
    const y = restPositions[i3 + 1];
    const z = restPositions[i3 + 2];
    if (z > 0.58 && Math.abs(x) < 0.62 && y > -0.3 && y < 0.42) faceVertexIds.push(i);
  }
}

function addScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#eee8de');
  scene.fog = new THREE.Fog('#eee8de', 5.6, 10.5);

  const hemi = new THREE.HemisphereLight('#f6fbff', '#8b674d', 2.1);
  scene.add(hemi);

  const key = new THREE.DirectionalLight('#fff5e6', 4.2);
  key.position.set(-3.2, 5.6, 3.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4.5;
  key.shadow.camera.right = 4.5;
  key.shadow.camera.top = 4.5;
  key.shadow.camera.bottom = -4.5;
  key.shadow.bias = -0.0002;
  scene.add(key);

  const rim = new THREE.PointLight('#75bcff', 42, 8, 2);
  rim.position.set(2.7, 2.4, -2.6);
  scene.add(rim);

  const warm = new THREE.PointLight('#ffd2a0', 25, 6, 2);
  warm.position.set(-2.6, 1.6, 2.3);
  scene.add(warm);

  const tableMaterial = new THREE.MeshStandardMaterial({
    map: createWoodTexture(),
    color: '#d1ae86',
    roughness: 0.63,
    metalness: 0,
  });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), tableMaterial);
  table.rotation.x = -Math.PI / 2;
  table.receiveShadow = true;
  table.position.y = 0;
  scene.add(table);
}

function setCameraFrame(force = false) {
  const rect = stage.getBoundingClientRect();
  const aspect = Math.max(0.2, rect.width / Math.max(1, rect.height));
  if (!force && initialCamera) return;

  if (aspect < 0.8) {
    camera.position.set(0.15, 1.5, 4.45);
    controls.target.set(0, 0.55, 0);
    camera.fov = 39;
  } else {
    camera.position.set(0.35, 1.28, 3.65);
    controls.target.set(0, 0.48, 0);
    camera.fov = 36;
  }
  camera.updateProjectionMatrix();
  controls.update();
  initialCamera = camera.position.clone();
  initialTarget = controls.target.clone();
}

function resizeRenderer() {
  const rect = stage.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const pixelBudgetDpr = Math.sqrt(MAX_PIXELS / (rect.width * rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR, pixelBudgetDpr);
  renderer.setPixelRatio(Math.max(0.65, dpr));
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function pointerToNdc(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function beginGrab(event) {
  if (grab.active || event.button > 0) return;
  pointerToNdc(event);
  raycaster.setFromCamera(pointerNdc, camera);
  const hit = raycaster.intersectObject(slimeMesh, false)[0];
  if (!hit) return;

  event.preventDefault();
  event.stopPropagation();
  renderer.domElement.setPointerCapture(event.pointerId);
  controls.enabled = false;
  grab.active = true;
  grab.pointerId = event.pointerId;
  grab.localPoint.copy(hit.point);
  slimeRoot.worldToLocal(grab.localPoint);
  grab.localTarget.copy(grab.localPoint);
  grab.delta.set(0, 0, 0);
  grab.lastTargetWorld.copy(hit.point);
  grab.pointerVelocityWorld.set(0, 0, 0);
  grab.lastMoveTime = performance.now();

  const viewNormal = camera.getWorldDirection(tempA).normalize();
  dragPlane.setFromNormalAndCoplanarPoint(viewNormal, hit.point);
  grab.weights = new Float32Array(positionAttr.count);
  const sigma2 = 0.42 * 0.42 * 2;
  for (let i = 0; i < positionAttr.count; i += 1) {
    const i3 = i * 3;
    const dx = restPositions[i3] - grab.localPoint.x;
    const dy = restPositions[i3 + 1] - grab.localPoint.y;
    const dz = restPositions[i3 + 2] - grab.localPoint.z;
    grab.weights[i] = Math.exp(-(dx * dx + dy * dy + dz * dz) / sigma2);
  }
  liveStatus.textContent = 'スライムを掴みました。ドラッグして伸ばせます。';
}

function moveGrab(event) {
  if (!grab.active || event.pointerId !== grab.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  pointerToNdc(event);
  raycaster.setFromCamera(pointerNdc, camera);
  if (!raycaster.ray.intersectPlane(dragPlane, tempWorld)) return;

  const now = performance.now();
  const dt = Math.max(0.001, (now - grab.lastMoveTime) / 1000);
  tempA.copy(tempWorld).sub(grab.lastTargetWorld).multiplyScalar(1 / dt);
  grab.pointerVelocityWorld.lerp(tempA, 0.55);
  grab.lastTargetWorld.copy(tempWorld);
  grab.lastMoveTime = now;

  tempLocal.copy(tempWorld);
  slimeRoot.worldToLocal(tempLocal);
  grab.localTarget.copy(tempLocal);
  grab.delta.copy(grab.localTarget).sub(grab.localPoint);
  const maxStretch = 1.05;
  if (grab.delta.length() > maxStretch) grab.delta.setLength(maxStretch);
}

function endGrab(event) {
  if (!grab.active || event.pointerId !== grab.pointerId) return;
  event.preventDefault();
  event.stopPropagation();

  tempA.copy(grab.pointerVelocityWorld);
  tempB.copy(slimeRoot.position);
  tempA.transformDirection(slimeRoot.matrixWorld.clone().invert());
  tempA.multiplyScalar(0.055);
  for (let i = 0; i < positionAttr.count; i += 1) {
    const weight = grab.weights[i];
    const i3 = i * 3;
    velocities[i3] += tempA.x * weight;
    velocities[i3 + 1] += tempA.y * weight;
    velocities[i3 + 2] += tempA.z * weight;
  }

  grab.active = false;
  grab.pointerId = null;
  grab.weights = null;
  controls.enabled = true;
  if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  liveStatus.textContent = 'スライムを離しました。揺れが全体へ伝わります。';
}

function stepSoftBody(dt) {
  const positions = positionAttr.array;
  const count = positionAttr.count;
  const stiffness = 42;
  const damping = 7.4;
  const coupling = 31;
  const grabStrength = 120;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const dx = positions[i3] - restPositions[i3];
    const dy = positions[i3 + 1] - restPositions[i3 + 1];
    const dz = positions[i3 + 2] - restPositions[i3 + 2];
    const neighbors = adjacency[i];
    let avgX = 0;
    let avgY = 0;
    let avgZ = 0;
    for (let j = 0; j < neighbors.length; j += 1) {
      const n3 = neighbors[j] * 3;
      avgX += positions[n3] - restPositions[n3];
      avgY += positions[n3 + 1] - restPositions[n3 + 1];
      avgZ += positions[n3 + 2] - restPositions[n3 + 2];
    }
    const inv = neighbors.length ? 1 / neighbors.length : 0;
    avgX *= inv; avgY *= inv; avgZ *= inv;

    let ax = -stiffness * dx - damping * velocities[i3] + coupling * (avgX - dx);
    let ay = -stiffness * dy - damping * velocities[i3 + 1] + coupling * (avgY - dy);
    let az = -stiffness * dz - damping * velocities[i3 + 2] + coupling * (avgZ - dz);

    if (grab.active && grab.weights) {
      const weight = grab.weights[i];
      const tx = grab.delta.x * weight;
      const ty = grab.delta.y * weight;
      const tz = grab.delta.z * weight;
      ax += grabStrength * weight * (tx - dx);
      ay += grabStrength * weight * (ty - dy);
      az += grabStrength * weight * (tz - dz);
    }

    accelerations[i3] = ax;
    accelerations[i3 + 1] = ay;
    accelerations[i3 + 2] = az;
  }

  const maxVelocity = 5.5;
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    velocities[i3] += accelerations[i3] * dt;
    velocities[i3 + 1] += accelerations[i3 + 1] * dt;
    velocities[i3 + 2] += accelerations[i3 + 2] * dt;
    const speedSq = velocities[i3] ** 2 + velocities[i3 + 1] ** 2 + velocities[i3 + 2] ** 2;
    if (speedSq > maxVelocity * maxVelocity) {
      const scale = maxVelocity / Math.sqrt(speedSq);
      velocities[i3] *= scale;
      velocities[i3 + 1] *= scale;
      velocities[i3 + 2] *= scale;
    }
    positions[i3] += velocities[i3] * dt;
    positions[i3 + 1] += velocities[i3 + 1] * dt;
    positions[i3 + 2] += velocities[i3 + 2] * dt;
  }

  positionAttr.needsUpdate = true;
  slimeMesh.geometry.computeVertexNormals();
  updateFaceFromSurface();
}

function updateFaceFromSurface() {
  if (!faceVertexIds.length) return;
  let dx = 0;
  let dy = 0;
  let dz = 0;
  for (const i of faceVertexIds) {
    const i3 = i * 3;
    dx += positionAttr.array[i3] - restPositions[i3];
    dy += positionAttr.array[i3 + 1] - restPositions[i3 + 1];
    dz += positionAttr.array[i3 + 2] - restPositions[i3 + 2];
  }
  const inv = 1 / faceVertexIds.length;
  faceMesh.position.set(dx * inv * 0.9, 0.05 + dy * inv * 0.85, 0.76 + dz * inv * 0.82);
}

function applyDirectionalJiggle(direction) {
  if (direction.lengthSq() < 0.0001) return;
  tempA.copy(direction).normalize();
  for (let i = 0; i < positionAttr.count; i += 1) {
    const i3 = i * 3;
    const y = restPositions[i3 + 1];
    const influence = THREE.MathUtils.clamp((y + 0.52) / 1.35, 0, 1);
    velocities[i3] += -tempA.x * (0.045 + influence * 0.045);
    velocities[i3 + 2] += -tempA.z * (0.045 + influence * 0.045);
  }
}

function applyJumpImpulse() {
  for (let i = 0; i < positionAttr.count; i += 1) {
    const i3 = i * 3;
    const y = restPositions[i3 + 1];
    velocities[i3 + 1] += 0.16 + Math.max(0, -y) * 0.18;
  }
}

function applyLandingImpulse(strength) {
  const s = THREE.MathUtils.clamp(strength, 0.6, 3.4);
  for (let i = 0; i < positionAttr.count; i += 1) {
    const i3 = i * 3;
    const y = restPositions[i3 + 1];
    const topWeight = THREE.MathUtils.clamp((y + 0.1) / 0.85, 0, 1);
    const radial = new THREE.Vector2(restPositions[i3], restPositions[i3 + 2]);
    if (radial.lengthSq() > 0.0001) radial.normalize();
    velocities[i3] += radial.x * 0.12 * s * (1 - topWeight * 0.4);
    velocities[i3 + 1] -= 0.12 * s * topWeight;
    velocities[i3 + 2] += radial.y * 0.12 * s * (1 - topWeight * 0.4);
  }
}

function requestJump() {
  if (!grounded || grab.active) return;
  grounded = false;
  rootVerticalVelocity = 2.45;
  applyJumpImpulse();
  liveStatus.textContent = 'スライムがジャンプしました。';
}

function currentMoveVector() {
  const forwardInput = (keys.has('KeyW') || keys.has('ArrowUp') || virtualDirections.has('forward') ? 1 : 0)
    - (keys.has('KeyS') || keys.has('ArrowDown') || virtualDirections.has('back') ? 1 : 0);
  const rightInput = (keys.has('KeyD') || keys.has('ArrowRight') || virtualDirections.has('right') ? 1 : 0)
    - (keys.has('KeyA') || keys.has('ArrowLeft') || virtualDirections.has('left') ? 1 : 0);

  camera.getWorldDirection(tempForward);
  tempForward.y = 0;
  if (tempForward.lengthSq() < 0.0001) tempForward.set(0, 0, -1);
  tempForward.normalize();
  tempRight.crossVectors(tempForward, camera.up).normalize();
  tempMove.set(0, 0, 0)
    .addScaledVector(tempForward, forwardInput)
    .addScaledVector(tempRight, rightInput);
  if (tempMove.lengthSq() > 1) tempMove.normalize();
  return tempMove;
}

function stepLocomotion(dt) {
  const move = currentMoveVector();
  const desired = tempA.copy(move).multiplyScalar(grab.active ? 0 : 0.92);
  const blend = 1 - Math.exp(-dt * 8.5);
  rootVelocity.lerp(desired, blend);
  slimeRoot.position.x += rootVelocity.x * dt;
  slimeRoot.position.z += rootVelocity.z * dt;
  slimeRoot.position.x = THREE.MathUtils.clamp(slimeRoot.position.x, -2.35, 2.35);
  slimeRoot.position.z = THREE.MathUtils.clamp(slimeRoot.position.z, -2.35, 2.35);

  const speed = Math.hypot(rootVelocity.x, rootVelocity.z);
  movementPulse += dt * speed;
  if (movementPulse > 0.115) {
    movementPulse = 0;
    applyDirectionalJiggle(rootVelocity);
  }

  if (!grounded) {
    rootVerticalVelocity -= 6.25 * dt;
    slimeRoot.position.y += rootVerticalVelocity * dt;
    if (slimeRoot.position.y <= BASE_Y) {
      const impact = Math.abs(rootVerticalVelocity);
      slimeRoot.position.y = BASE_Y;
      rootVerticalVelocity = 0;
      grounded = true;
      if (impact > 0.55) applyLandingImpulse(impact);
    }
  }

  const desiredTarget = tempB.set(slimeRoot.position.x, 0.48 + Math.max(0, slimeRoot.position.y - BASE_Y) * 0.18, slimeRoot.position.z);
  const followBlend = 1 - Math.exp(-dt * 3.8);
  tempA.copy(desiredTarget).sub(controls.target).multiplyScalar(followBlend);
  controls.target.add(tempA);
  camera.position.add(tempA);
}

function resetSimulation() {
  positionAttr.array.set(restPositions);
  positionAttr.needsUpdate = true;
  velocities.fill(0);
  accelerations.fill(0);
  slimeMesh.geometry.computeVertexNormals();
  slimeRoot.position.set(0, BASE_Y, 0);
  rootVelocity.set(0, 0, 0);
  rootVerticalVelocity = 0;
  grounded = true;
  grab.active = false;
  grab.pointerId = null;
  grab.weights = null;
  controls.enabled = true;
  if (initialCamera && initialTarget) {
    camera.position.copy(initialCamera);
    controls.target.copy(initialTarget);
    controls.update();
  }
  updateFaceFromSurface();
  liveStatus.textContent = 'スライムを初期位置へ戻しました。';
}

function animate() {
  const rawDt = Math.min(clock.getDelta(), 0.034);
  const substeps = Math.max(1, Math.ceil(rawDt / (1 / 90)));
  const dt = rawDt / substeps;
  for (let i = 0; i < substeps; i += 1) {
    stepLocomotion(dt);
    stepSoftBody(dt);
  }
  controls.update();
  renderer.render(scene, camera);
  animationFrame = requestAnimationFrame(animate);
}

function bindInput() {
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', beginGrab, { capture: true });
  canvas.addEventListener('pointermove', moveGrab, { capture: true });
  canvas.addEventListener('pointerup', endGrab, { capture: true });
  canvas.addEventListener('pointercancel', endGrab, { capture: true });

  window.addEventListener('keydown', (event) => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === 'Space' && !event.repeat) requestJump();
    else keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => {
    keys.clear();
    virtualDirections.clear();
  });

  document.querySelectorAll('[data-move]').forEach((button) => {
    const direction = button.dataset.move;
    const down = (event) => {
      event.preventDefault();
      virtualDirections.add(direction);
      button.setPointerCapture?.(event.pointerId);
    };
    const up = (event) => {
      event.preventDefault();
      virtualDirections.delete(direction);
    };
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointercancel', up);
    button.addEventListener('lostpointercapture', up);
  });

  jumpButton.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    requestJump();
  });
  resetButton.addEventListener('click', resetSimulation);
}

function init() {
  try {
    addScene();
    camera = new THREE.PerspectiveCamera(36, 1, 0.05, 30);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', '青いスライム。スライムをドラッグして変形、空いた場所をドラッグしてカメラ回転、ピンチまたはホイールでズームできます。');
    mount.append(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = 0.72;
    controls.maxPolarAngle = 1.42;

    createSlime();
    setCameraFrame(true);
    resizeRenderer();
    bindInput();

    const resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(stage);
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.dispose();
    }, { once: true });

    playground.dataset.ready = 'true';
    fallbackMessage.textContent = '';
    clock.start();
    animate();
  } catch (error) {
    console.error(error);
    fallbackMessage.textContent = '3Dの初期化に失敗しました。ブラウザを更新してもう一度お試しください。';
  }
}

init();
