import { DecyError } from "../core/errors.ts";

/** Intl.NumberFormat with Latin digits; a malformed locale or option fails with our error instead of a RangeError. */
export function numberFormat(
  locale: string,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, { ...options, numberingSystem: "latn" });
  } catch (error) {
    throw new DecyError(
      "invalidIntlOptions",
      `Intl rejected locale "${locale}" or its options: ${String(error)}`,
    );
  }
}
