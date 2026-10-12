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
