import type { Decimal } from "./decimal.ts";

export interface AlignedUnits {
  a: bigint;
  b: bigint;
  scale: number;
}

/** Brings both values to the larger scale, so their units can be added or compared directly. */
export function align(a: Decimal, b: Decimal): AlignedUnits {
  const scale = Math.max(a.scale, b.scale);
  return {
    a: a.units * 10n ** BigInt(scale - a.scale),
    b: b.units * 10n ** BigInt(scale - b.scale),
    scale,
  };
}
