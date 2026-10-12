import { createDecimal, type Decimal } from "../core/decimal.ts";
import { MAX_SCALE } from "../core/scale.ts";
import type { InputOptions } from "./inputOptions.ts";
import { localeSymbols } from "./localeSymbols.ts";
import { numberFormat } from "./numberFormat.ts";
import { splitSign } from "./splitSign.ts";

export type ParseError =
  | "empty"
  | "incomplete"
  | "invalidCharacter"
  | "invalidGrouping"
  | "multipleDecimalSeparators"
  | "tooManyFractionDigits"
  | "negativeNotAllowed";

export type ParseResult = { ok: true; value: Decimal } | { ok: false; error: ParseError };

const DIGITS = /^\d*$/;

/**
 * Reads a complete user input in the given locale. Never throws for user input; errors are codes for i18n.
 * Grouping separators are accepted only where Intl itself would put them: "1.234,50" is fine in de-DE,
 * "12.50" is not (it is not 1250 and not 12.5, it is an error). Surrounding whitespace is ignored.
 */
export function parse(text: string, locale: string, options: InputOptions = {}): ParseResult {
  const { maxFractionDigits = MAX_SCALE, allowNegative = true } = options;
  const symbols = localeSymbols(locale);

  const input = text.trim();
  if (input === "") return failure("empty");

  const { isNegative, rest } = splitSign(input, symbols);
  if (isNegative && !allowNegative) return failure("negativeNotAllowed");

  const sections = rest.split(symbols.decimal);
  if (sections.length > 2) return failure("multipleDecimalSeparators");
  const [integerText = "", fractionText = ""] = sections;

  const integerDigits = integerText.split(symbols.group).join("");
  const isGrouped = integerDigits !== integerText;
  if (!DIGITS.test(integerDigits) || !DIGITS.test(fractionText)) {
    return failure(fractionText.includes(symbols.group) ? "invalidGrouping" : "invalidCharacter");
  }
  if (integerDigits === "" && fractionText === "") return failure("incomplete");
  if (isGrouped && integerText !== groupedLikeIntl(integerDigits, locale))
    return failure("invalidGrouping");
  if (fractionText.length > Math.min(maxFractionDigits, MAX_SCALE))
    return failure("tooManyFractionDigits");

  const units = BigInt(`${integerDigits || "0"}${fractionText}`);
  return { ok: true, value: createDecimal(isNegative ? -units : units, fractionText.length) };
}

function groupedLikeIntl(digits: string, locale: string): string {
  return numberFormat(locale, { useGrouping: true }).format(BigInt(digits));
}

function failure(error: ParseError): ParseResult {
  return { ok: false, error };
}
