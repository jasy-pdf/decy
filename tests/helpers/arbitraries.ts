import fc from "fast-check";
import { createDecimal, type Decimal } from "../../src/core/decimal.ts";

export const locales = [
  "de-DE",
  "en-US",
  "de-CH",
  "en-IN",
  "fr-FR",
  "ar",
  "he",
  "fa",
  "ur",
] as const;

/** Random decimals: signs, zero, up to 20 integer digits, scale 0 to 6. */
export const anyDecimal: fc.Arbitrary<Decimal> = fc
  .tuple(fc.bigInt({ min: -(10n ** 26n), max: 10n ** 26n }), fc.integer({ min: 0, max: 6 }))
  .map(([units, scale]) => createDecimal(units, scale));
