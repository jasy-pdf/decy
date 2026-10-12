import { createDecimal, type Decimal } from "../core/decimal.ts";

/**
 * percent % of base, exact: percentageOf(8.40, 19) = 1.5960.
 * Dividing by 100 is only a shift of two digits, so nothing is rounded. Round the result as the case requires.
 */
export function percentageOf(base: Decimal, percent: Decimal): Decimal {
  return createDecimal(base.units * percent.units, base.scale + percent.scale + 2);
}
