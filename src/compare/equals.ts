import type { Decimal } from "../core/decimal.ts";
import { compare } from "./compare.ts";

/** Equal in value; the scale does not matter: 12.5 equals 12.50. */
export function equals(a: Decimal, b: Decimal): boolean {
  return compare(a, b) === 0;
}
