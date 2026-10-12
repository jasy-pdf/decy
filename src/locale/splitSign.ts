import type { LocaleSymbols } from "./localeSymbols.ts";

export interface SignedText {
  isNegative: boolean;
  rest: string;
}

/** Splits off a leading minus: the ASCII hyphen-minus or the locale's own minus sign. */
export function splitSign(text: string, symbols: LocaleSymbols): SignedText {
  for (const minus of new Set(["-", symbols.minus])) {
    if (text.startsWith(minus)) return { isNegative: true, rest: text.slice(minus.length) };
  }
  return { isNegative: false, rest: text };
}
