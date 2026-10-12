import type { Decimal } from "../core/decimal.ts";

/** Strictly below zero; zero is not negative. */
export function isNegative(value: Decimal): boolean {
  return value.units < 0n;
}
