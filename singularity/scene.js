import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import {
  particleVertex,
  particleFragment,
  rimVertex,
  rimFragment,
  diskVertex,
  diskFragment,
  lensShader
} from "./shaders.js";

function gaussian() {
  const u = Math.max(0.00001, Math.random());
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
}

function buildGalaxyGeometry(THREERef, particleCount) {
  const geometry = new THREERef.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const seeds = new Float32Array(particleCount);
  const sizes = new Float32Array(particleCount);
  const hues = new Float32Array(particleCount);
  const arms = 5;

  for (let i = 0; i < particleCount; i++) {
    const radius = Math.pow(Math.random(), 1.72) * 8.7 + 0.12;
    const arm = i % arms;
    const armAngle = arm / arms * Math.PI * 2;
    const angularScatter = gaussian() * (0.055 + radius * 0.021);
    const angle = armAngle + radius * 0.72 + angularScatter;
    const radialScatter = gaussian() * (0.06 + radius * 0.022);
    const rr = Math.max(0.06, radius + radialScatter);

    positions[i * 3] = Math.cos(angle) * rr;
    positions[i * 3 + 1] = gaussian() * (0.045 + radius * 0.018);
    positions[i * 3 + 2] = Math.sin(angle) * rr;
    seeds[i] = Math.random();
    sizes[i] = 0.55 + Math.pow(Math.random(), 4.0) * 2.7;
    hues[i] = (arm / arms + Math.random() * 0.24) % 1;
  }

  geometry.setAttribute("position", new THREERef.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREERef.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREERef.BufferAttribute(sizes, 1));
  geometry.setAttribute("aHue", new THREERef.BufferAttribute(hues, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

function buildBackgroundStars(THREERef, count, isMobile) {
  const geometry = new THREERef.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 18 + Math.random() * 34;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREERef.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  geometry.setAttribute("position", new THREERef.BufferAttribute(positions, 3));
  const material = new THREERef.PointsMaterial({
    color: 0xb8d8ff,
    size: isMobile ? 0.035 : 0.045,
    transparent: true,
    opacity: 0.68,
    blending: THREERef.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  return new THREERef.Points(geometry, material);
}

export function createUniverse({ stage, particleCount, backgroundStarCount, dpr, isMobile }) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    alpha: false
  });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040a);
  scene.fog = new THREE.FogExp2(0x02040a, 0.022);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 100);
  const baseCameraY = isMobile ? 3.0 : 2.2;
  const baseCameraZ = isMobile ? 18.0 : 13.5;
  camera.position.set(0, baseCameraY, baseCameraZ);

  const galaxyGroup = new THREE.Group();
  galaxyGroup.rotation.x = -0.18;
  scene.add(galaxyGroup);

  const uniforms = {
    uTime: { value: 0 },
    uCollapse: { value: 0 },
    uBurst: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: dpr }
  };

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });

  const galaxy = new THREE.Points(buildGalaxyGeometry(THREE, particleCount), particleMaterial);
  galaxy.frustumCulled = false;
  galaxyGroup.add(galaxy);

  const backgroundStars = buildBackgroundStars(THREE, backgroundStarCount, isMobile);
  scene.add(backgroundStars);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  galaxyGroup.add(core);

  const rimMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      uTime: uniforms.uTime,
      uCollapse: uniforms.uCollapse
    },
    vertexShader: rimVertex,
    fragmentShader: rimFragment
  });
  const rim = new THREE.Mesh(new THREE.SphereGeometry(0.74, 48, 32), rimMaterial);
  galaxyGroup.add(rim);

  const diskMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: uniforms.uTime,
      uCollapse: uniforms.uCollapse
    },
    vertexShader: diskVertex,
    fragmentShader: diskFragment
  });

  const disk = new THREE.Mesh(new THREE.RingGeometry(0.72, 3.8, 192, 6), diskMaterial);
  disk.rotation.x = -Math.PI / 2;
  disk.rotation.z = 0.18;
  disk.scale.y = 0.54;
  galaxyGroup.add(disk);

  const disk2 = new THREE.Mesh(disk.geometry, diskMaterial);
  disk2.rotation.x = -Math.PI / 2;
  disk2.rotation.z = -0.36;
  disk2.scale.set(0.68, 0.38, 0.68);
  galaxyGroup.add(disk2);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    isMobile ? 0.72 : 0.92,
    0.8,
    0.08
  );
  bloomPass.threshold = 0.03;
  bloomPass.radius = isMobile ? 0.62 : 0.78;
  composer.addPass(bloomPass);

  const lensPass = new ShaderPass(lensShader);
  lensPass.uniforms.uCenter.value = new THREE.Vector2(0.5, 0.5);
  composer.addPass(lensPass);

  function reseed() {
    const oldGeometry = galaxy.geometry;
    galaxy.geometry = buildGalaxyGeometry(THREE, particleCount);
    oldGeometry.dispose();
  }

  function resize(width, height) {
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render({ now, delta, collapse, burst, pointer, gyro }) {
    uniforms.uTime.value = now * 0.001;
    uniforms.uCollapse.value = collapse;
    uniforms.uBurst.value = burst;
    uniforms.uPointer.value.set(pointer.x, pointer.y);

    lensPass.uniforms.uTime.value = now * 0.001;
    lensPass.uniforms.uCollapse.value = collapse;
    lensPass.uniforms.uStrength.value = 0.16 + collapse * 0.42 + burst * 0.14;

    const targetX = pointer.x * 1.05 + gyro.x * 0.82;
    const targetY = baseCameraY + pointer.y * 0.48 + gyro.y * 0.36;
    camera.position.x += (targetX - camera.position.x) * Math.min(1, delta * 2.6);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 2.6);
    const collapseZoom = isMobile ? 3.2 : 2.0;
    camera.position.z += ((baseCameraZ - collapse * collapseZoom + burst * 1.2) - camera.position.z) * Math.min(1, delta * 2.4);
    camera.lookAt(0, 0, 0);

    galaxyGroup.rotation.y += delta * (0.025 + collapse * 0.16);
    galaxyGroup.rotation.z += ((pointer.x + gyro.x) * 0.055 - galaxyGroup.rotation.z) * Math.min(1, delta * 2.2);
    core.scale.setScalar(1 + collapse * 0.75 - burst * 0.18);
    rim.scale.setScalar(1 + collapse * 0.92 + Math.sin(now * 0.004) * 0.025);
    disk.rotation.z += delta * (0.12 + collapse * 0.58);
    disk2.rotation.z -= delta * (0.08 + collapse * 0.34);
    backgroundStars.rotation.y += delta * 0.003;
    bloomPass.strength = (isMobile ? 0.72 : 0.92) + collapse * 0.54 + burst * 0.28;

    composer.render();
  }

  return { resize, render, reseed, renderer };
}
