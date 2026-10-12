import { align } from "../core/align.ts";
import { createDecimal, type Decimal } from "../core/decimal.ts";

/** a + b. The result has the larger scale: 12.50 + 1 = 13.50. */
export function add(a: Decimal, b: Decimal): Decimal {
  const aligned = align(a, b);
  return createDecimal(aligned.a + aligned.b, aligned.scale);
}
