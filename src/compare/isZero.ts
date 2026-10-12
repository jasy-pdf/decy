import type { Decimal } from "../core/decimal.ts";

export function isZero(value: Decimal): boolean {
  return value.units === 0n;
}
