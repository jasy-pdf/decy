import { DecyError } from "./errors.ts";

/**
 * How to resolve digits that do not fit:
 * - halfAwayFromZero: commercial rounding (DIN 1333), 2.5 -> 3, -2.5 -> -3
 * - halfEven: banker's rounding, ties go to the even neighbor, 2.5 -> 2, 3.5 -> 4
 * - towardZero: cut off, 2.9 -> 2, -2.9 -> -2
 * - awayFromZero: any rest rounds up in size, 2.1 -> 3, -2.1 -> -3
 * - floor: toward minus infinity, -2.1 -> -3
 * - ceil: toward plus infinity, 2.1 -> 3
 */
export type RoundingMode =
  | "halfAwayFromZero"
  | "halfEven"
  | "towardZero"
  | "awayFromZero"
  | "floor"
  | "ceil";

// Record forces every mode of the type to be listed here.
const KNOWN_MODES: Record<RoundingMode, true> = {
  halfAwayFromZero: true,
  halfEven: true,
  towardZero: true,
  awayFromZero: true,
  floor: true,
  ceil: true,
};

/** Checked before any work, so an unknown mode (e.g. from a config) fails at once, not on the first odd value. */
export function assertRoundingMode(mode: RoundingMode): void {
  if (!Object.hasOwn(KNOWN_MODES, mode)) {
    throw new DecyError("invalidRoundingMode", `Unknown rounding mode: ${String(mode)}.`);
  }
}
