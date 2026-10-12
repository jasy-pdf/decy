import { DecyError } from "../core/errors.ts";
import { numberFormat } from "./numberFormat.ts";

export interface LocaleSymbols {
  decimal: string;
  group: string;
  minus: string;
}

// Seven integer digits: some languages (e.g. Ewe) only group from six digits on.
const PROBE = -1234567.1;

const cache = new Map<string, LocaleSymbols>();

/**
 * The separators of a locale, straight from the runtime's Intl data: de-DE "," and ".", en-US "." and ",".
 * Runtimes may differ in details (de-CH groups with ' or ’), but format and parse always agree within one runtime.
 */
export function localeSymbols(locale: string): LocaleSymbols {
  const cached = cache.get(locale);
  if (cached) return cached;

  const parts = numberFormat(locale).formatToParts(PROBE);
  const symbols: LocaleSymbols = {
    decimal: partValue(parts, "decimal", locale),
    group: partValue(parts, "group", locale),
    minus: partValue(parts, "minusSign", locale),
  };
  cache.set(locale, symbols);
  return symbols;
}

function partValue(
  parts: Intl.NumberFormatPart[],
  type: Intl.NumberFormatPartTypes,
  locale: string,
): string {
  const part = parts.find((candidate) => candidate.type === type);
  if (!part) {
    throw new DecyError(
      "unsupportedLocale",
      `Intl gives no ${type} symbol for locale "${locale}".`,
    );
  }
  return part.value;
}
