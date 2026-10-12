import { createDecimal, type Decimal } from "../core/decimal.ts";
import { DecyError } from "../core/errors.ts";
import { assertScale } from "../core/scale.ts";

export interface AllocateOptions {
  /** Digits after the decimal point of every part, e.g. 2 for cents. */
  scale: number;
}

/**
 * Splits total by ratios without losing or inventing a single unit: the parts always sum to total.
 * allocate(10.00, [1, 1, 1], { scale: 2 }) = [3.34, 3.33, 3.33].
 * Leftover units go to the parts with the largest remainder; on a tie, to the earlier part.
 */
export function allocate(
  total: Decimal,
  ratios: readonly Decimal[],
  options: AllocateOptions,
): Decimal[] {
  assertScale(options.scale);
  if (total.scale > options.scale) {
    throw new DecyError(
      "invalidScale",
      "Total has more digits than the allocation scale. Round it first.",
    );
  }
  const weights = toIntegerWeights(ratios);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0n);

  const isNegative = total.units < 0n;
  const amount =
    (isNegative ? -total.units : total.units) * 10n ** BigInt(options.scale - total.scale);

  const shares = weights.map((weight) => (amount * weight) / weightSum);
  const remainders = weights.map((weight) => (amount * weight) % weightSum);
  let leftover = amount - shares.reduce((sum, share) => sum + share, 0n);

  // Indices by remainder, largest first; sort is stable, so ties keep the earlier part first.
  const byRemainder = remainders
    .map((_, index) => index)
    .sort((a, b) => compareDescending(remainders[a]!, remainders[b]!));
  for (const index of byRemainder) {
    if (leftover === 0n) break;
    shares[index]! += 1n;
    leftover -= 1n;
  }

  return shares.map((share) => createDecimal(isNegative ? -share : share, options.scale));
}

/** Ratios as integers on a common scale. They must not be negative and at least one must be positive. */
function toIntegerWeights(ratios: readonly Decimal[]): bigint[] {
  if (ratios.length === 0) {
    throw new DecyError("invalidRatios", "At least one ratio is required.");
  }
  if (ratios.some((ratio) => ratio.units < 0n)) {
    throw new DecyError("invalidRatios", "Ratios must not be negative.");
  }
  const scale = Math.max(...ratios.map((ratio) => ratio.scale));
  const weights = ratios.map((ratio) => ratio.units * 10n ** BigInt(scale - ratio.scale));
  if (weights.every((weight) => weight === 0n)) {
    throw new DecyError("invalidRatios", "At least one ratio must be greater than zero.");
  }
  return weights;
}

function compareDescending(a: bigint, b: bigint): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}
