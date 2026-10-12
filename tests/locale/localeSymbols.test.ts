import { expect, test, vi } from "vite-plus/test";
import { localeSymbols } from "../../src/locale/localeSymbols.ts";
import { runtimeLanguages } from "../helpers/arbitraries.ts";
import { errorCode } from "../helpers/errorCode.ts";

test("German and English swap the separators", () => {
  expect(localeSymbols("de-DE")).toEqual({ decimal: ",", group: ".", minus: "-" });
  expect(localeSymbols("en-US")).toEqual({ decimal: ".", group: ",", minus: "-" });
});

test("Ewe groups only from six digits and still has all symbols", () => {
  expect(localeSymbols("ee")).toEqual({ decimal: ".", group: ",", minus: "-" });
});

test("every language of the runtime yields all three symbols", () => {
  const languages = runtimeLanguages();
  expect(languages.length).toBeGreaterThan(100);
  for (const language of languages) {
    const symbols = localeSymbols(language);
    expect([language, symbols.decimal && symbols.group && symbols.minus]).toEqual([
      language,
      expect.any(String),
    ]);
  }
});

test("a malformed locale fails with our error", () => {
  expect(errorCode(() => localeSymbols("not a locale!"))).toBe("invalidIntlOptions");
});

test("a runtime that gives no group symbol fails with our error, not a TypeError", () => {
  // oxlint-disable-next-line typescript/unbound-method -- called with its own `this` below
  const original = Intl.NumberFormat.prototype.formatToParts;
  const withoutGroup = vi
    .spyOn(Intl.NumberFormat.prototype, "formatToParts")
    .mockImplementation(function (this: Intl.NumberFormat, value) {
      return original.call(this, value).filter((part) => part.type !== "group");
    });
  try {
    // A locale nothing else used, so the cache cannot answer.
    expect(errorCode(() => localeSymbols("de-LU"))).toBe("unsupportedLocale");
  } finally {
    withoutGroup.mockRestore();
  }
});
