import { createDecimal, type Decimal } from "../core/decimal.ts";
import { resolveInputOptions, type InputOptions } from "./inputOptions.ts";
import { localeSymbols } from "./localeSymbols.ts";
import { normalizeSpaces } from "./normalizeSpaces.ts";
import { numberFormat } from "./numberFormat.ts";
import { splitSign } from "./splitSign.ts";
import { stripDirectionMarks } from "./stripDirectionMarks.ts";

export interface ParseOptions extends InputOptions {
  /**
   * Accept grouping separators where Intl would put them, e.g. "1.234,50". For paste and import only.
   * Defaults to false: in a form, "1.234.567" may be 1234,567 typed with the numpad dot. Only `true` enables it.
   */
  allowGrouping?: boolean;
}

export type ParseError =
  | "empty"
  | "incomplete"
  | "invalidCharacter"
  | "groupingNotAllowed"
  | "invalidGrouping"
  | "ambiguousGrouping"
  | "multipleDecimalSeparators"
  | "tooManyFractionDigits"
  | "negativeNotAllowed";

export type ParseResult = { ok: true; value: Decimal } | { ok: false; error: ParseError };

const DIGITS = /^\d*$/;

// Only these can also be a decimal key, so only these make a single separator ambiguous.
const CONFUSABLE_GROUPS = new Set([".", ","]);

/**
 * Reads a complete user input in the given locale. Never throws for user input; errors are codes for i18n.
 * Grouping is refused unless allowGrouping is true. Then separators are accepted only where Intl itself
 * would put them ("1.234,50" in de-DE, never "12.50"), and a single "." or "," without a decimal part
 * ("1.234") is ambiguous: 1234, or 1,234 typed with the numpad dot. Refused, never guessed.
 * Surrounding whitespace and invisible direction marks are ignored.
 */
export function parse(text: string, locale: string, options: ParseOptions = {}): ParseResult {
  const { maxFractionDigits, allowNegative } = resolveInputOptions(options);
  const allowGrouping = options.allowGrouping === true;
  const symbols = localeSymbols(locale);

  const input = stripDirectionMarks(text).trim();
  if (input === "") return failure("empty");

  const { isNegative, rest } = splitSign(input, symbols);
  if (isNegative && !allowNegative) return failure("negativeNotAllowed");

  const sections = normalizeSpaces(rest, symbols.group).split(symbols.decimal);
  if (sections.length > 2) return failure("multipleDecimalSeparators");
  const [integerText = "", fractionText = ""] = sections;
  const hasDecimalPart = sections.length === 2;

  const integerGroups = integerText.split(symbols.group);
  const integerDigits = integerGroups.join("");
  const isGrouped = integerGroups.length > 1;

  if (!DIGITS.test(integerDigits) || !DIGITS.test(fractionText)) {
    return failure(fractionText.includes(symbols.group) ? "invalidGrouping" : "invalidCharacter");
  }
  if (integerDigits === "" && fractionText === "") {
    return failure("incomplete");
  }
  if (isGrouped && !allowGrouping) {
    return failure("groupingNotAllowed");
  }
  if (isGrouped && integerText !== groupedLikeIntl(integerDigits, locale)) {
    return failure("invalidGrouping");
  }
  if (
    isGrouped &&
    integerGroups.length === 2 &&
    !hasDecimalPart &&
    CONFUSABLE_GROUPS.has(symbols.group)
  ) {
    return failure("ambiguousGrouping");
  }
  if (fractionText.length > maxFractionDigits) {
    return failure("tooManyFractionDigits");
  }

  const units = BigInt(`${integerDigits || "0"}${fractionText}`);
  return { ok: true, value: createDecimal(isNegative ? -units : units, fractionText.length) };
}

function groupedLikeIntl(digits: string, locale: string): string {
  return numberFormat(locale, { useGrouping: true }).format(BigInt(digits));
}

function failure(error: ParseError): ParseResult {
  return { ok: false, error };
}
