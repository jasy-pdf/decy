import { createDecimal, type Decimal } from "../core/decimal.ts";

/** |value|, same scale. */
export function abs(value: Decimal): Decimal {
  return value.units < 0n ? createDecimal(-value.units, value.scale) : value;
}
