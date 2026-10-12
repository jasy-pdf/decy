export type { Decimal } from "./core/decimal.ts";
export { MAX_SCALE } from "./core/decimal.ts";
export { DecyError, type DecyErrorCode } from "./core/errors.ts";

export { decimal } from "./convert/decimal.ts";
export { fromNumber } from "./convert/fromNumber.ts";
export { fromBigInt } from "./convert/fromBigInt.ts";
export { toDecimalString } from "./convert/toDecimalString.ts";
