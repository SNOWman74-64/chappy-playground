export function createGyroController({ onStatus = () => {} } = {}) {
  const state = {
    active: false,
    calibrating: false,
    samples: [],
    baseBeta: 0,
    baseGamma: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    bound: false
  };

  function rotateForScreen(x, y) {
    const angle = screen.orientation?.angle ?? window.orientation ?? 0;
    if (angle === 90) return { x: y, y: -x };
    if (angle === 270 || angle === -90) return { x: -y, y: x };
    if (angle === 180) return { x: -x, y: -y };
    return { x, y };
  }

  function bind() {
    if (state.bound) return;
    window.addEventListener("deviceorientation", (event) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      if (state.calibrating) {
        state.samples.push({ beta, gamma });
        if (state.samples.length >= 14) {
          state.baseBeta = state.samples.reduce((sum, item) => sum + item.beta, 0) / state.samples.length;
          state.baseGamma = state.samples.reduce((sum, item) => sum + item.gamma, 0) / state.samples.length;
          state.samples = [];
          state.calibrating = false;
          state.active = true;
          onStatus("ready");
        }
        return;
      }

      if (!state.active) return;
      const rotated = rotateForScreen(gamma - state.baseGamma, beta - state.baseBeta);
      const deadZone = 1.1;
      const normalize = (value) => {
        const magnitude = Math.max(0, Math.abs(value) - deadZone);
        return Math.sign(value) * Math.min(1, magnitude / 15);
      };
      state.targetX = normalize(rotated.x);
      state.targetY = normalize(rotated.y);
    });
    state.bound = true;
  }

  async function toggle() {
    if (state.active || state.calibrating) {
      state.active = false;
      state.calibrating = false;
      state.samples = [];
      state.targetX = 0;
      state.targetY = 0;
      onStatus("off");
      return "off";
    }

    if (typeof DeviceOrientationEvent === "undefined") {
      onStatus("unsupported");
      return "unsupported";
    }

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") throw new Error("permission denied");
      }
      bind();
      state.samples = [];
      state.calibrating = true;
      onStatus("calibrating");
      return "calibrating";
    } catch (error) {
      console.error(error);
      onStatus("denied");
      return "denied";
    }
  }

  function update(deltaSeconds) {
    const amount = Math.min(1, deltaSeconds * 3.2);
    state.x += (state.targetX - state.x) * amount;
    state.y += (state.targetY - state.y) * amount;
    if (!state.active && !state.calibrating) {
      state.targetX = 0;
      state.targetY = 0;
    }
    return { x: state.x, y: state.y };
  }

  return {
    toggle,
    update,
    get active() {
      return state.active;
    },
    get calibrating() {
      return state.calibrating;
    }
  };
}
