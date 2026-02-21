// Procedural background music using Web Audio API
// Indian-inspired lo-fi loop — no external files needed

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let loopTimers: ReturnType<typeof setTimeout>[] = [];

const BPM = 85;
const BEAT = 60 / BPM;

// Pentatonic scale (Indian-ish feel): C4, D4, E4, G4, A4, C5, D5
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(ctx.destination);
  }
  return { ctx, masterGain: masterGain! };
}

function playNote(
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.5
) {
  const { ctx: c, masterGain: mg } = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(mg);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playDrone(startTime: number, duration: number) {
  const { ctx: c, masterGain: mg } = getCtx();
  // Low C drone
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = 130.81; // C3

  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.setValueAtTime(0.3, startTime + duration - 0.5);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(mg);
  osc.start(startTime);
  osc.stop(startTime + duration);

  // Fifth harmony
  const osc2 = c.createOscillator();
  const gain2 = c.createGain();
  osc2.type = "sine";
  osc2.frequency.value = 196.0; // G3

  gain2.gain.setValueAtTime(0.15, startTime);
  gain2.gain.setValueAtTime(0.15, startTime + duration - 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc2.connect(gain2);
  gain2.connect(mg);
  osc2.start(startTime);
  osc2.stop(startTime + duration);
}

function playPercussion(startTime: number) {
  const { ctx: c, masterGain: mg } = getCtx();

  // Tabla-like hit using noise
  const bufferSize = c.sampleRate * 0.08;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 400;
  filter.Q.value = 5;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.6, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(mg);
  noise.start(startTime);
  noise.stop(startTime + 0.1);
}

// Melody patterns (index into SCALE array)
const PATTERNS = [
  [0, 2, 4, 3, 2, 4, 5, 4],
  [5, 4, 3, 2, 0, 2, 3, 4],
  [0, 0, 3, 4, 5, 4, 3, 2],
  [4, 5, 6, 5, 4, 3, 2, 0],
];

function playBar(barIndex: number) {
  if (!isPlaying || !ctx) return;

  const now = ctx.currentTime + 0.05;
  const barDuration = BEAT * 8;

  // Drone (full bar)
  playDrone(now, barDuration);

  // Melody
  const pattern = PATTERNS[barIndex % PATTERNS.length];
  pattern.forEach((noteIdx, i) => {
    const noteTime = now + i * BEAT;
    const freq = SCALE[noteIdx];
    // Vary volume and type for feel
    const type: OscillatorType = i % 2 === 0 ? "sine" : "triangle";
    playNote(freq, noteTime, BEAT * 0.8, type, 0.4 + Math.random() * 0.2);
  });

  // Percussion — on beats 0, 2, 4, 6 and lighter on 1, 3, 5, 7
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      playPercussion(now + i * BEAT);
    }
  }

  // Schedule next bar
  const timer = setTimeout(() => {
    playBar(barIndex + 1);
  }, barDuration * 1000 - 100); // slight overlap for seamless loop

  loopTimers.push(timer);
}

export function startBgMusic() {
  if (isPlaying) return;

  const { ctx: c } = getCtx();
  if (c.state === "suspended") {
    c.resume();
  }

  isPlaying = true;
  playBar(0);
}

export function stopBgMusic() {
  isPlaying = false;
  loopTimers.forEach(clearTimeout);
  loopTimers = [];

  if (ctx && masterGain) {
    // Cancel any scheduled changes and set gain to 0 immediately
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    // Close and reset the context so next start is fresh
    const oldCtx = ctx;
    setTimeout(() => {
      oldCtx.close().catch(() => {});
    }, 300);
    ctx = null;
    masterGain = null;
  }
}

export function isBgMusicPlaying() {
  return isPlaying;
}
