import fc from "fast-check";
import { createDecimal, type Decimal } from "../../src/core/decimal.ts";

/** Each group separator family at least once: "." "," space, narrow space, apostrophe, RTL, Ewe (groups from 6 digits). */
export const locales = [
  "de-DE",
  "en-US",
  "de-CH",
  "en-IN",
  "fr-FR",
  "de-AT",
  "sv-SE",
  "ar",
  "he",
  "fa",
  "ur",
  "ee",
] as const;

/** Every two-letter language the runtime's Intl knows, for sweeps that must not miss an odd one. */
export function runtimeLanguages(): string[] {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const candidates = letters.flatMap((first) => letters.map((second) => `${first}${second}`));
  return Intl.NumberFormat.supportedLocalesOf(candidates);
}

/** Random decimals: signs, zero, up to 20 integer digits, scale 0 to 6. */
export const anyDecimal: fc.Arbitrary<Decimal> = fc
  .tuple(fc.bigInt({ min: -(10n ** 26n), max: 10n ** 26n }), fc.integer({ min: 0, max: 6 }))
  .map(([units, scale]) => createDecimal(units, scale));
