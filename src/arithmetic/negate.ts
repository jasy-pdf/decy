import { createDecimal, type Decimal } from "../core/decimal.ts";

/** -value, same scale. */
export function negate(value: Decimal): Decimal {
  return createDecimal(-value.units, value.scale);
}
