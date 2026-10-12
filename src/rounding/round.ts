import { createDecimal, type Decimal } from "../core/decimal.ts";
import { divideRounded } from "../core/divideRounded.ts";
import type { RoundingMode } from "../core/roundingMode.ts";
import { assertScale } from "../core/scale.ts";

export interface RoundOptions {
  /** Digits after the decimal point in the result. */
  scale: number;
  mode: RoundingMode;
}

/** Rounds to exactly `scale` digits. A smaller scale is padded: round(12.5, scale 2) = 12.50. */
export function round(value: Decimal, options: RoundOptions): Decimal {
  assertScale(options.scale);
  const shift = BigInt(Math.abs(value.scale - options.scale));

  if (value.scale <= options.scale) {
    return createDecimal(value.units * 10n ** shift, options.scale);
  }
  return createDecimal(divideRounded(value.units, 10n ** shift, options.mode), options.scale);
}
