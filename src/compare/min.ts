import type { Decimal } from "../core/decimal.ts";
import { compare } from "./compare.ts";

/** The smaller value. On a tie, a is returned (keeps its scale). */
export function min(a: Decimal, b: Decimal): Decimal {
  return compare(b, a) < 0 ? b : a;
}
