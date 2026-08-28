export function createSoundEngine() {
  let context = null;
  let nodes = null;
  let enabled = false;

  function createGraph() {
    context = new (window.AudioContext || window.webkitAudioContext)();

    const master = context.createGain();
    master.gain.value = 0.0001;
    master.connect(context.destination);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.8;
    filter.connect(master);

    const droneA = context.createOscillator();
    droneA.type = "sine";
    droneA.frequency.value = 46;
    const gainA = context.createGain();
    gainA.gain.value = 0.14;
    droneA.connect(gainA).connect(filter);

    const droneB = context.createOscillator();
    droneB.type = "triangle";
    droneB.frequency.value = 69;
    const gainB = context.createGain();
    gainB.gain.value = 0.038;
    droneB.connect(gainB).connect(filter);

    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.11;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain).connect(droneB.detune);

    droneA.start();
    droneB.start();
    lfo.start();
    nodes = { master, filter, droneA, droneB };
  }

  async function toggle() {
    if (!context) createGraph();
    await context.resume();
    enabled = !enabled;
    const now = context.currentTime;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.setTargetAtTime(enabled ? 0.22 : 0.0001, now, 0.12);
    return enabled;
  }

  function update(collapse, burst) {
    if (!context || !nodes) return;
    const now = context.currentTime;
    nodes.droneA.frequency.setTargetAtTime(46 + collapse * 34, now, 0.08);
    nodes.droneB.frequency.setTargetAtTime(69 + collapse * 57, now, 0.08);
    nodes.filter.frequency.setTargetAtTime(380 + collapse * 2100 + burst * 900, now, 0.08);
  }

  function burst() {
    if (!context || !nodes || !enabled) return;
    const now = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(120, now);
    oscillator.frequency.exponentialRampToValueAtTime(24, now + 1.1);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    oscillator.connect(gain).connect(nodes.master);
    oscillator.start(now);
    oscillator.stop(now + 1.15);

    const buffer = context.createBuffer(1, context.sampleRate * 0.7, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = context.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(920, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(110, now + 0.7);
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    noise.connect(noiseFilter).connect(noiseGain).connect(nodes.master);
    noise.start(now);
  }

  return {
    toggle,
    update,
    burst,
    get enabled() {
      return enabled;
    }
  };
}
