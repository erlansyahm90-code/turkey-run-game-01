// A small seeded random number generator (mulberry32). Runs and screenshot scenes pass a
// seed so the table sets itself the same way every time; an unseeded run uses the clock.

export function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function pick(random, items) {
  return items[Math.floor(random() * items.length) % items.length];
}

export function range(random, min, max) {
  return min + random() * (max - min);
}
