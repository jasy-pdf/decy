import { toDecimalString } from "../convert/toDecimalString.ts";
import type { Decimal } from "../core/decimal.ts";
import { DecyError } from "../core/errors.ts";
import { numberFormat } from "./numberFormat.ts";

/** "percent" is left out on purpose: it multiplies by 100. Use percentageOf for that. */
export type FormatStyle = "decimal" | "currency" | "unit";

/** The Intl options that do not touch the digits. Fraction digits always follow the value's scale. */
export interface FormatOptions {
  style?: FormatStyle;
  currency?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  unit?: string;
  unitDisplay?: "short" | "long" | "narrow";
  useGrouping?: boolean;
  signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
}

// Records force every key and style of the types above to be listed.
const ALLOWED_KEYS: Record<keyof FormatOptions, true> = {
  style: true,
  currency: true,
  currencyDisplay: true,
  unit: true,
  unitDisplay: true,
  useGrouping: true,
  signDisplay: true,
};
const ALLOWED_STYLES: Record<FormatStyle, true> = { decimal: true, currency: true, unit: true };

/**
 * Formats for display, e.g. format(1234.50, "de-DE", { style: "currency", currency: "EUR" }) = "1.234,50 €".
 * Never rounds: it shows exactly the digits of the value. Round first to get 2 digits for money.
 */
export function format(value: Decimal, locale: string, options: FormatOptions = {}): string {
  assertFormatOptions(options);
  const formatter = numberFormat(locale, {
    style: options.style,
    currency: options.currency,
    currencyDisplay: options.currencyDisplay,
    unit: options.unit,
    unitDisplay: options.unitDisplay,
    useGrouping: options.useGrouping,
    signDisplay: options.signDisplay,
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

/** JS callers can pass anything; whatever could change the digits must fail here, with the right reason. */
function assertFormatOptions(options: FormatOptions): void {
  const unknownKey = Object.keys(options).find((key) => !Object.hasOwn(ALLOWED_KEYS, key));
  if (unknownKey !== undefined) {
    throw new DecyError("invalidIntlOptions", `Unsupported format option: ${unknownKey}.`);
  }
  if (options.style !== undefined && !Object.hasOwn(ALLOWED_STYLES, options.style)) {
    throw new DecyError(
      "invalidIntlOptions",
      `Unsupported format style: ${String(options.style)}.`,
    );
  }
}
