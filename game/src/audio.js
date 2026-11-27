// Dinner Table Dash — sound. Every effect is synthesised with WebAudio oscillators and
// noise bursts; the game ships no audio files. The context wakes on the first user gesture
// (the Start button), which is also when browsers allow sound at all.

let ctx = null;
let master = null;

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
}

function tone({ freq = 440, freqEnd = null, type = 'square', dur = 0.15, vol = 0.3, delay = 0 }) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.2, vol = 0.3, delay = 0, low = 400, high = 3000 }) {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = (low + high) / 2;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t0);
}

export const sfx = {
  gobble() {
    // A wobbly little warble: the turkey announces itself.
    for (let i = 0; i < 5; i++) {
      tone({ freq: 620 + Math.sin(i * 2.1) * 160, type: 'sawtooth', dur: 0.07, vol: 0.16, delay: i * 0.055 });
    }
  },
  jump() {
    tone({ freq: 500, freqEnd: 980, type: 'square', dur: 0.14, vol: 0.14 });
  },
  dash() {
    // A rush of feathers: a fast rising noise sweep under a soft whoop.
    noise({ dur: 0.3, vol: 0.26, low: 800, high: 3400 });
    tone({ freq: 300, freqEnd: 720, type: 'sine', dur: 0.22, vol: 0.12 });
  },
  corn() {
    tone({ freq: 1180, type: 'sine', dur: 0.07, vol: 0.2 });
    tone({ freq: 1560, type: 'sine', dur: 0.1, vol: 0.16, delay: 0.05 });
  },
  knifeWarn() {
    tone({ freq: 1900, freqEnd: 1500, type: 'sine', dur: 0.12, vol: 0.1 });
  },
  knifeHit() {
    noise({ dur: 0.16, vol: 0.5, low: 900, high: 5200 });
    tone({ freq: 210, freqEnd: 60, type: 'triangle', dur: 0.22, vol: 0.5 });
    tone({ freq: 3400, type: 'square', dur: 0.05, vol: 0.12, delay: 0.01 });
  },
  nearMiss() {
    noise({ dur: 0.18, vol: 0.18, low: 2400, high: 6000 });
  },
  forkSweep() {
    noise({ dur: 0.5, vol: 0.16, low: 1200, high: 3800 });
  },
  splat() {
    noise({ dur: 0.28, vol: 0.34, low: 200, high: 900 });
    tone({ freq: 160, freqEnd: 55, type: 'sine', dur: 0.25, vol: 0.3 });
  },
  handWhoosh() {
    noise({ dur: 0.7, vol: 0.3, low: 300, high: 1600 });
  },
  hurt() {
    tone({ freq: 880, freqEnd: 220, type: 'sawtooth', dur: 0.22, vol: 0.26 });
    tone({ freq: 1240, freqEnd: 330, type: 'sawtooth', dur: 0.18, vol: 0.18, delay: 0.05 });
  },
  cloche() {
    // The serving dome lands: a bright metal clang with a long ring.
    tone({ freq: 1244, type: 'sine', dur: 0.7, vol: 0.3 });
    tone({ freq: 1866, type: 'sine', dur: 0.5, vol: 0.18 });
    tone({ freq: 830, type: 'triangle', dur: 0.3, vol: 0.24 });
    noise({ dur: 0.1, vol: 0.3, low: 2000, high: 6000 });
  },
  pawWarn() {
    // A little two-note "mrrp": the cat has spotted the turkey.
    tone({ freq: 740, freqEnd: 980, type: 'triangle', dur: 0.11, vol: 0.16 });
    tone({ freq: 880, freqEnd: 620, type: 'triangle', dur: 0.14, vol: 0.14, delay: 0.1 });
  },
  pawSlam() {
    noise({ dur: 0.14, vol: 0.3, low: 250, high: 1100 });
    tone({ freq: 130, freqEnd: 55, type: 'sine', dur: 0.18, vol: 0.34 });
  },
  splash() {
    noise({ dur: 0.3, vol: 0.3, low: 500, high: 2200 });
    tone({ freq: 320, freqEnd: 90, type: 'sine', dur: 0.22, vol: 0.2 });
  },
  flareWarn() {
    // A rising hiss as the burner grate heats up.
    noise({ dur: 0.85, vol: 0.13, low: 2600, high: 6800 });
  },
  flare() {
    // The burner whoomphs up: low roar under a steam hiss.
    noise({ dur: 0.6, vol: 0.42, low: 120, high: 900 });
    noise({ dur: 0.7, vol: 0.2, low: 2800, high: 7000, delay: 0.05 });
    tone({ freq: 95, freqEnd: 42, type: 'triangle', dur: 0.55, vol: 0.4 });
  },
  fanfare() {
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((freq, i) => tone({ freq, type: 'square', dur: 0.16, vol: 0.2, delay: i * 0.11 }));
  },
};
