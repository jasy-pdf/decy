export type { Decimal } from "./core/decimal.ts";
export { MAX_SCALE } from "./core/scale.ts";
export type { RoundingMode } from "./core/roundingMode.ts";
export { DecyError, type DecyErrorCode } from "./core/errors.ts";

export { decimal } from "./convert/decimal.ts";
export { fromNumber } from "./convert/fromNumber.ts";
export { fromBigInt } from "./convert/fromBigInt.ts";
export { toDecimalString } from "./convert/toDecimalString.ts";

export { add } from "./arithmetic/add.ts";
export { subtract } from "./arithmetic/subtract.ts";
export { multiply } from "./arithmetic/multiply.ts";
export { negate } from "./arithmetic/negate.ts";
export { abs } from "./arithmetic/abs.ts";
export { sum } from "./arithmetic/sum.ts";

export { compare, type Comparison } from "./compare/compare.ts";
export { equals } from "./compare/equals.ts";
export { isZero } from "./compare/isZero.ts";
export { isNegative } from "./compare/isNegative.ts";
export { min } from "./compare/min.ts";
export { max } from "./compare/max.ts";

export { round, type RoundOptions } from "./rounding/round.ts";
export { roundToStep } from "./rounding/roundToStep.ts";

export { divide, type DivideOptions } from "./division/divide.ts";
export { percentageOf } from "./division/percentageOf.ts";

export { allocate, type AllocateOptions } from "./allocation/allocate.ts";
