import { DecyError } from "./errors.ts";

/**
 * An exact decimal number: value = units / 10^scale.
 * 12.50 is { units: 1250n, scale: 2 }. The scale is kept, so 12.50 and 12.5 differ in scale but not in value.
 */
export interface Decimal {
  readonly units: bigint;
  readonly scale: number;
}

/** Scales add up on multiplication; the limit stops runaway precision long before it hurts. */
export const MAX_SCALE = 30;

/** The only way a Decimal comes into existence: validated and frozen. */
export function createDecimal(units: bigint, scale: number): Decimal {
  if (!Number.isInteger(scale) || scale < 0 || scale > MAX_SCALE) {
    throw new DecyError(
      "invalidScale",
      `Scale must be an integer from 0 to ${MAX_SCALE}, got ${scale}.`,
    );
  }
  return Object.freeze({ units, scale });
}
