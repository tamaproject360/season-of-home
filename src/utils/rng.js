/**
 * Seeded Pseudo-Random Number Generator (PRNG)
 * Formula deterministic based on Mulberry32 algorithm
 */
export class SeededRNG {
  constructor(seed = 47021) {
    this.seed = seed >>> 0;
  }

  setSeed(seed) {
    this.seed = seed >>> 0;
  }

  // Returns float in [0, 1)
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in [min, max] inclusive
  range(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick one element from array deterministically
  pick(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(this.next() * array.length)];
  }
}

export const GlobalRNG = new SeededRNG(47021);
