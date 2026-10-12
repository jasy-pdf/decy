import { createDecimal, type Decimal } from "../core/decimal.ts";
import { add } from "./add.ts";

/** Adds all values. An empty list sums to 0. */
export function sum(values: readonly Decimal[]): Decimal {
  return values.reduce(add, createDecimal(0n, 0));
}
