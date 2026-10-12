import { numberFormat } from "./numberFormat.ts";

export interface LocaleSymbols {
  decimal: string;
  group: string;
  minus: string;
}

const cache = new Map<string, LocaleSymbols>();

/**
 * The separators of a locale, straight from the runtime's Intl data: de-DE "," and ".", en-US "." and ",".
 * Runtimes may differ in details (de-CH groups with ' or ’), but format and parse always agree within one runtime.
 */
export function localeSymbols(locale: string): LocaleSymbols {
  const cached = cache.get(locale);
  if (cached) return cached;

  const parts = numberFormat(locale).formatToParts(-11111.1);
  const symbols: LocaleSymbols = {
    decimal: parts.find((part) => part.type === "decimal")!.value,
    group: parts.find((part) => part.type === "group")!.value,
    minus: parts.find((part) => part.type === "minusSign")!.value,
  };
  cache.set(locale, symbols);
  return symbols;
}
