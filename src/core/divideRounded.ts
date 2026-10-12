import { DecyError } from "./errors.ts";
import type { RoundingMode } from "./roundingMode.ts";

/** numerator / denominator as an integer, the rest resolved by the rounding mode. */
export function divideRounded(numerator: bigint, denominator: bigint, mode: RoundingMode): bigint {
  if (denominator === 0n) {
    throw new DecyError("divisionByZero", "Division by zero.");
  }
  const isNegative = numerator < 0n !== denominator < 0n;
  const absNumerator = numerator < 0n ? -numerator : numerator;
  const absDenominator = denominator < 0n ? -denominator : denominator;

  // Work on absolute values: bigint division truncates toward zero, which hides the sign's direction.
  const quotient = absNumerator / absDenominator;
  const rest = absNumerator % absDenominator;
  const magnitude =
    rest === 0n
      ? quotient
      : quotient + roundUpBy(mode, quotient, rest * 2n, absDenominator, isNegative);

  return isNegative ? -magnitude : magnitude;
}

/** 1n if the magnitude must grow by one, else 0n. twiceRest compared to the denominator tells below/at/above half. */
function roundUpBy(
  mode: RoundingMode,
  quotient: bigint,
  twiceRest: bigint,
  denominator: bigint,
  isNegative: boolean,
): bigint {
  switch (mode) {
    case "towardZero":
      return 0n;
    case "awayFromZero":
      return 1n;
    case "floor":
      return isNegative ? 1n : 0n;
    case "ceil":
      return isNegative ? 0n : 1n;
    case "halfAwayFromZero":
      return twiceRest >= denominator ? 1n : 0n;
    case "halfEven":
      if (twiceRest !== denominator) return twiceRest > denominator ? 1n : 0n;
      return quotient % 2n === 0n ? 0n : 1n;
    default:
      throw new DecyError("invalidRoundingMode", `Unknown rounding mode: ${String(mode)}.`);
  }
}
