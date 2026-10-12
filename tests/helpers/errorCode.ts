import { DecyError, type DecyErrorCode } from "../../src/core/errors.ts";

/** Runs fn and returns the DecyError code it threw; fails loudly on anything else. */
export function errorCode(fn: () => unknown): DecyErrorCode {
  try {
    fn();
  } catch (error) {
    if (error instanceof DecyError) return error.code;
    throw error;
  }
  throw new Error("Expected a DecyError, nothing was thrown.");
}
