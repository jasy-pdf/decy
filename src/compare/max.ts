import type { Decimal } from "../core/decimal.ts";
import { compare } from "./compare.ts";

/** The larger value. On a tie, a is returned (keeps its scale). */
export function max(a: Decimal, b: Decimal): Decimal {
  return compare(b, a) > 0 ? b : a;
}
