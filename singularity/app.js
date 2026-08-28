import { createUniverse } from "./scene.js";
import { createSoundEngine } from "./audio.js";
import { createGyroController } from "./gyro.js";

const stage = document.querySelector("#stage");
const loading = document.querySelector("#loading");
const fallback = document.querySelector("#fallback");
const flash = document.querySelector("#flash");
const fpsEl = document.querySelector("#fps");
const particleLabel = document.querySelector("#particleLabel");
const collapseOrb = document.querySelector("#collapseOrb");
const collapseTitle = document.querySelector("#collapseTitle");
const collapseHint = document.querySelector("#collapseHint");
const collapseValue = document.querySelector("#collapseValue");
const soundBtn = document.querySelector("#soundBtn");
const gyroBtn = document.querySelector("#gyroBtn");
const rebirthBtn = document.querySelector("#rebirthBtn");

const isMobile = matchMedia("(pointer: coarse)").matches || innerWidth < 720;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const particleCount = reducedMotion ? 6000 : (isMobile ? 15000 : 26000);
const backgroundStarCount = isMobile ? 1300 : 2400;
const dpr = Math.min(devicePixelRatio || 1, isMobile ? 1.55 : 1.9);
particleLabel.textContent = `${particleCount.toLocaleString()} PARTICLES`;

let universe;
try {
  universe = createUniverse({
    stage,
    particleCount,
    backgroundStarCount,
    dpr,
    isMobile
  });
} catch (error) {
  console.error(error);
  loading.classList.add("hidden");
  fallback.classList.remove("hidden");
  throw error;
}

const sound = createSoundEngine();
let seedNumber = Math.floor(Math.random() * 0xffffff);

const gyro = createGyroController({
  onStatus(status) {
    if (status === "ready") {
      gyroBtn.textContent = "GYRO ON";
      gyroBtn.classList.add("active");
      collapseHint.textContent = "GYRO CALIBRATED · tilt the device";
    } else if (status === "calibrating") {
      gyroBtn.textContent = "HOLD STILL…";
      collapseHint.textContent = "普段の持ち方で一瞬だけ静止";
    } else if (status === "off") {
      gyroBtn.textContent = "GYRO OFF";
      gyroBtn.classList.remove("active");
    } else if (status === "unsupported") {
      gyroBtn.textContent = "NO GYRO";
    } else {
      gyroBtn.textContent = "GYRO DENIED";
    }
  }
});

const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};

let holding = false;
let collapse = 0;
let burst = 0;
let rebirthTime = 0;
let lastFrame = performance.now();
let fpsAccumulator = 0;
let fpsFrames = 0;
let lastFpsUpdate = performance.now();

function universeId() {
  return seedNumber.toString(16).toUpperCase().padStart(6, "0");
}

function updatePointer(event) {
  const rect = stage.getBoundingClientRect();
  pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
  pointer.targetY = Math.max(-1, Math.min(1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)));
}

stage.addEventListener("pointerdown", (event) => {
  holding = true;
  updatePointer(event);
  stage.setPointerCapture?.(event.pointerId);
  document.body.classList.add("interacting");
});

stage.addEventListener("pointermove", updatePointer);

function releasePointer(event) {
  holding = false;
  stage.releasePointerCapture?.(event.pointerId);
  if (!rebirthTime) document.body.classList.remove("interacting");
}

stage.addEventListener("pointerup", releasePointer);
stage.addEventListener("pointercancel", releasePointer);

function reseedGalaxy() {
  seedNumber = Math.floor(Math.random() * 0xffffff);
  universe.reseed();
  collapseHint.textContent = `UNIVERSE ${universeId()} ONLINE`;
}

function triggerRebirth() {
  if (rebirthTime) return;
  rebirthTime = 0.001;
  holding = false;
  document.body.classList.add("interacting");
  collapseTitle.textContent = "EVENT HORIZON BREACHED";
  collapseHint.textContent = "Spacetime is rebooting…";
  flash.classList.add("active");
  setTimeout(() => flash.classList.remove("active"), 120);
  setTimeout(reseedGalaxy, 260);
  if (navigator.vibrate) navigator.vibrate([28, 24, 70, 28, 120]);
  sound.burst();
}

rebirthBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  collapse = Math.max(collapse, 0.92);
  triggerRebirth();
});

soundBtn.addEventListener("click", async (event) => {
  event.stopPropagation();
  try {
    const enabled = await sound.toggle();
    soundBtn.textContent = enabled ? "SOUND ON" : "SOUND OFF";
    soundBtn.classList.toggle("active", enabled);
  } catch (error) {
    console.error(error);
    soundBtn.textContent = "SOUND ERROR";
  }
});

gyroBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  gyro.toggle();
});

function updateUi() {
  const percent = Math.round(collapse * 100);
  collapseValue.textContent = `${String(percent).padStart(3, "0")}%`;
  collapseOrb.style.setProperty("--progress", `${collapse}turn`);

  if (!rebirthTime) {
    collapseTitle.textContent = collapse > 0.74
      ? "CRITICAL MASS APPROACHING"
      : "HOLD ANYWHERE TO COLLAPSE";

    if (collapse < 0.03 && !gyro.calibrating) {
      collapseHint.textContent = `UNIVERSE ${universeId()} · drag to bend spacetime`;
    }
  }
}

function resize() {
  universe.resize(innerWidth, innerHeight);
}

addEventListener("resize", resize, { passive: true });
resize();

function animate(now) {
  requestAnimationFrame(animate);
  const delta = Math.min(0.05, (now - lastFrame) / 1000 || 0.016);
  lastFrame = now;

  pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 4.8);
  pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 4.8);
  const gyroValue = gyro.update(delta);

  if (rebirthTime) {
    rebirthTime += delta;
    if (rebirthTime < 0.28) {
      collapse = 1;
      burst = smoothstep(rebirthTime, 0, 0.28);
    } else {
      const t = clamp((rebirthTime - 0.28) / 1.05, 0, 1);
      collapse = 1 - smoothstep(t, 0, 1);
      burst = 1 - t;
    }

    if (rebirthTime > 1.38) {
      rebirthTime = 0;
      collapse = 0;
      burst = 0;
      document.body.classList.remove("interacting");
      collapseTitle.textContent = "HOLD ANYWHERE TO COLLAPSE";
    }
  } else {
    collapse += (holding ? 0.43 : -0.72) * delta;
    collapse = clamp(collapse, 0, 1);
    burst = Math.max(0, burst - delta * 1.5);
    if (collapse >= 0.995) triggerRebirth();
  }

  sound.update(collapse, burst);
  updateUi();
  universe.render({
    now,
    delta,
    collapse,
    burst,
    pointer,
    gyro: gyroValue
  });

  fpsAccumulator += delta;
  fpsFrames++;
  if (now - lastFpsUpdate > 650) {
    fpsEl.textContent = `${Math.round(fpsFrames / fpsAccumulator)} FPS`;
    fpsAccumulator = 0;
    fpsFrames = 0;
    lastFpsUpdate = now;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value, min, max) {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
let lastTouchEnd = 0;
document.addEventListener("touchend", (event) => {
  const current = Date.now();
  if (current - lastTouchEnd < 320) event.preventDefault();
  lastTouchEnd = current;
}, { passive: false });

loading.classList.add("hidden");
requestAnimationFrame(animate);
