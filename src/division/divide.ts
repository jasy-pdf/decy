import { createDecimal, type Decimal } from "../core/decimal.ts";
import { divideRounded } from "../core/divideRounded.ts";
import type { RoundingMode } from "../core/roundingMode.ts";
import { assertScale } from "../core/scale.ts";

export interface DivideOptions {
  /** Digits after the decimal point in the result. Division is rarely exact, so it is always required. */
  scale: number;
  mode: RoundingMode;
}

/** a / b, rounded once to `scale`: divide(10, 3, { scale: 2, mode: "halfAwayFromZero" }) = 3.33. */
export function divide(a: Decimal, b: Decimal, options: DivideOptions): Decimal {
  assertScale(options.scale);

  // (a.units / 10^a.scale) / (b.units / 10^b.scale) * 10^scale, kept in integers until the single rounding step.
  const numerator = a.units * 10n ** BigInt(b.scale + options.scale);
  const denominator = b.units * 10n ** BigInt(a.scale);

  return createDecimal(divideRounded(numerator, denominator, options.mode), options.scale);
}
