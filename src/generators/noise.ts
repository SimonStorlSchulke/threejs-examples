import alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

export type FbmArgs = {
  octaves: number,
  lacunarity: number,
  frequency: number,
  amplitude: number,
  gain: number,
  offset: number,
  seed: number,
}

export class FbmNoiseBuilder {
  private args = {
    octaves: 8,
    seed: 5,
    gain: 0.5,
    frequency: 0.1,
    amplitude: 0.8,
    lacunarity: 1.7,
    offset: 0.75,
  }

  octaves(value: number) {
    this.args.octaves = value;
    return this;
  }

  seed(value: number) {
    this.args.seed = value;
    return this;
  }

  gain(value: number) {
    this.args.gain = value;
    return this;
  }

  frequency(value: number) {
    this.args.frequency = value;
    return this;
  }

  amplitude(value: number) {
    this.args.amplitude = value;
    return this;
  }

  lacunarity(value: number) {
    this.args.lacunarity = value;
    return this;
  }

  offset(value: number) {
    this.args.offset = value;
    return this;
  }

  build() {
    return createFbmNoise(this.args);
  }
}

export function createFbmNoise(args: FbmArgs) {
  const noises: NoiseFunction2D[] = [];
  for (let i = 0; i < args.octaves; i++) {
    const prng = alea(i + args.seed);
    noises.push(createNoise2D(prng))
  }

  return (x: number, y: number) => {
    let value = 0;
    let amp = args.amplitude;
    let freq = args.frequency;
    for (let i = 0; i < args.octaves; i++) {
      value += amp * noises[i](freq * x, freq * y);
      x *= args.lacunarity;
      y *= args.lacunarity;
      amp *= args.gain;
    }
    return value + args.offset;
  }

}
