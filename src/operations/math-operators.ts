import { MathUtils } from "three";


export function mapRangeClamped(val: number, a1: number, a2: number, b1: number, b2: number) {
  return MathUtils.clamp(MathUtils.mapLinear(val, a1, a2, b1, b2), b1, b2);
}

export function mapRangeSmooth(val: number, a1: number, a2: number, b1: number, b2: number) {
  return MathUtils.mapLinear(MathUtils.smoothstep(val, a1, a2), 0, 1, b1, b2);

}

export function closeTo(a: number, b: number, epsilon: number = 0.01) {
    return Math.abs(a - b) < epsilon;
}