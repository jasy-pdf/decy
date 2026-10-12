import { createDecimal, type Decimal } from "../core/decimal.ts";

/** a * b, exact. Scales add up: 2.49 * 12 = 29.88, 0.5 * 0.5 = 0.25. Round afterwards if needed. */
export function multiply(a: Decimal, b: Decimal): Decimal {
  return createDecimal(a.units * b.units, a.scale + b.scale);
}
