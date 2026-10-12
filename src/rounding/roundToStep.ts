import { align } from "../core/align.ts";
import { createDecimal, type Decimal } from "../core/decimal.ts";
import { divideRounded } from "../core/divideRounded.ts";
import { DecyError } from "../core/errors.ts";
import { assertRoundingMode, type RoundingMode } from "../core/roundingMode.ts";

/**
 * Rounds to a multiple of step, e.g. 0.05 (Swiss cash) or 0.010 (10 g in kg).
 * The result has the scale of the step: roundToStep(1.234, 0.05) = 1.25.
 */
export function roundToStep(value: Decimal, step: Decimal, mode: RoundingMode): Decimal {
  assertRoundingMode(mode);
  if (step.units <= 0n) {
    throw new DecyError("invalidStep", "Step must be greater than zero.");
  }
  const aligned = align(value, step);
  const steps = divideRounded(aligned.a, aligned.b, mode);

  // steps * step.units is the result at the step's own scale, no conversion needed.
  return createDecimal(steps * step.units, step.scale);
}
