import { MAX_SCALE } from "../core/scale.ts";
import type { InputOptions } from "./inputOptions.ts";
import { localeSymbols } from "./localeSymbols.ts";
import { splitSign } from "./splitSign.ts";

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
  const { maxFractionDigits = MAX_SCALE, allowNegative = true } = options;
  const symbols = localeSymbols(locale);

  const { isNegative, rest } = splitSign(text, symbols);
  if (isNegative && !allowNegative) return false;

  const sections = rest.split(symbols.decimal);
  if (sections.length > 2) return false;
  const [integerText = "", fractionText = ""] = sections;

  return (
    DIGITS.test(integerText) &&
    DIGITS.test(fractionText) &&
    fractionText.length <= Math.min(maxFractionDigits, MAX_SCALE)
  );
}
