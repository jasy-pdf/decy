import { align } from "../core/align.ts";
import type { Decimal } from "../core/decimal.ts";

export type Comparison = -1 | 0 | 1;

/** -1 if a < b, 0 if equal in value, 1 if a > b. Usable as a sort comparator. */
export function compare(a: Decimal, b: Decimal): Comparison {
  const aligned = align(a, b);
  if (aligned.a < aligned.b) return -1;
  if (aligned.a > aligned.b) return 1;
  return 0;
}
