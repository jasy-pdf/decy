import { DecyError } from "../core/errors.ts";
import { MAX_SCALE } from "../core/scale.ts";

export interface InputOptions {
  /** Most digits allowed after the decimal separator, e.g. 2 for cents. Defaults to MAX_SCALE. */
  maxFractionDigits?: number;
  /** Defaults to true. */
  allowNegative?: boolean;
}

export interface ResolvedInputOptions {
  maxFractionDigits: number;
  allowNegative: boolean;
}

/** Defaults applied and validated: a bad option is a programmer error and must not look like a user error. */
export function resolveInputOptions(options: InputOptions): ResolvedInputOptions {
  const { maxFractionDigits = MAX_SCALE, allowNegative = true } = options;
  if (
    !Number.isInteger(maxFractionDigits) ||
    maxFractionDigits < 0 ||
    maxFractionDigits > MAX_SCALE
  ) {
    throw new DecyError(
      "invalidOptions",
      `maxFractionDigits must be an integer from 0 to ${MAX_SCALE}, got ${maxFractionDigits}.`,
    );
  }
  return { maxFractionDigits, allowNegative };
}
