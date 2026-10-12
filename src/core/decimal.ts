import { assertScale } from "./scale.ts";

/**
 * An exact decimal number: value = units / 10^scale.
 * 12.50 is { units: 1250n, scale: 2 }. The scale is kept, so 12.50 and 12.5 differ in scale but not in value.
 */
export interface Decimal {
  readonly units: bigint;
  readonly scale: number;
}

/** The only way a Decimal comes into existence: validated and frozen. */
export function createDecimal(units: bigint, scale: number): Decimal {
  assertScale(scale);
  return Object.freeze({ units, scale });
}
