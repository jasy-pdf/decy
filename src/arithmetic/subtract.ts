import { align } from "../core/align.ts";
import { createDecimal, type Decimal } from "../core/decimal.ts";

/** a - b. The result has the larger scale: 1.00 - 0.5 = 0.50. */
export function subtract(a: Decimal, b: Decimal): Decimal {
  const aligned = align(a, b);
  return createDecimal(aligned.a - aligned.b, aligned.scale);
}
