import { DecyError } from "./errors.ts";

/** Scales add up on multiplication; the limit stops runaway precision long before it hurts. */
export const MAX_SCALE = 30;

/** Checked before any bigint math, so a bad scale fails with our error, not a RangeError from BigInt. */
export function assertScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 0 || scale > MAX_SCALE) {
    throw new DecyError(
      "invalidScale",
      `Scale must be an integer from 0 to ${MAX_SCALE}, got ${scale}.`,
    );
  }
}
