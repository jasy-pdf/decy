export type DecyErrorCode =
  | "invalidDecimal"
  | "invalidNumber"
  | "invalidScale"
  | "invalidRoundingMode"
  | "invalidStep"
  | "invalidRatios"
  | "divisionByZero";

/** Thrown for programmer errors. User input never throws, it returns a result. */
export class DecyError extends Error {
  readonly code: DecyErrorCode;

  constructor(code: DecyErrorCode, message: string) {
    super(message);
    this.name = "DecyError";
    this.code = code;
  }
}
