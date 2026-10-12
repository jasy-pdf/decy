import { createDecimal, type Decimal } from "../core/decimal.ts";

/** Creates a whole Decimal (scale 0), e.g. a quantity of 12 pieces. */
export function fromBigInt(value: bigint): Decimal {
  return createDecimal(value, 0);
}
