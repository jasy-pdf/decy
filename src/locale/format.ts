import { toDecimalString } from "../convert/toDecimalString.ts";
import type { Decimal } from "../core/decimal.ts";
import { DecyError } from "../core/errors.ts";
import { numberFormat } from "./numberFormat.ts";

/** The Intl options that do not touch the digits. Fraction digits always follow the value's scale. */
export interface FormatOptions {
  style?: "decimal" | "currency" | "unit";
  currency?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  unit?: string;
  unitDisplay?: "short" | "long" | "narrow";
  useGrouping?: boolean;
  signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
}

/**
 * Formats for display, e.g. format(1234.50, "de-DE", { style: "currency", currency: "EUR" }) = "1.234,50 €".
 * Never rounds: it shows exactly the digits of the value. Round first to get 2 digits for money.
 */
export function format(value: Decimal, locale: string, options: FormatOptions = {}): string {
  const formatter = numberFormat(locale, {
    ...options,
    minimumFractionDigits: value.scale,
    maximumFractionDigits: value.scale,
  });
  const exact = toDecimalString(value);
  const parts = formatter.formatToParts(exact as Intl.StringNumericLiteral);

  // Old engines turn strings into floats and lose digits. Refuse to show a wrong number.
  const shownDigits = parts
    .filter((part) => part.type === "integer" || part.type === "fraction")
    .map((part) => part.value)
    .join("");
  if (shownDigits !== exact.replace(/[-.]/g, "")) {
    throw new DecyError(
      "unsupportedEnvironment",
      "This runtime's Intl cannot format decimal strings exactly.",
    );
  }
  return parts.map((part) => part.value).join("");
}
