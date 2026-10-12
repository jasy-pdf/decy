import { resolveInputOptions, type InputOptions } from "./inputOptions.ts";
import { localeSymbols } from "./localeSymbols.ts";
import { splitSign } from "./splitSign.ts";
import { stripDirectionMarks } from "./stripDirectionMarks.ts";

const DIGITS = /^\d*$/;

/**
 * May the user type this? For keystroke filtering (beforeinput): text is the field value after the keystroke.
 * Allows unfinished input like "", "-", "12," but never a grouping separator; grouping is the formatter's job.
 */
export function isValidPartialInput(
  text: string,
  locale: string,
  options: InputOptions = {},
): boolean {
  const { maxFractionDigits, allowNegative } = resolveInputOptions(options);
  const symbols = localeSymbols(locale);

  const { isNegative, rest } = splitSign(stripDirectionMarks(text), symbols);
  if (isNegative && !allowNegative) return false;

  const sections = rest.split(symbols.decimal);
  if (sections.length > 2) return false;
  const [integerText = "", fractionText = ""] = sections;

  // A decimal separator that can never be followed by a digit is not valid either.
  if (sections.length === 2 && maxFractionDigits === 0) return false;

  return (
    DIGITS.test(integerText) &&
    DIGITS.test(fractionText) &&
    fractionText.length <= maxFractionDigits
  );
}
