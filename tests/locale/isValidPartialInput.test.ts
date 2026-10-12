import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { format } from "../../src/locale/format.ts";
import { isValidPartialInput } from "../../src/locale/isValidPartialInput.ts";
import { anyDecimal, locales } from "../helpers/arbitraries.ts";
import { errorCode } from "../helpers/errorCode.ts";

describe("isValidPartialInput", () => {
  test.each(["", "-", "1", "12,", "12,5", "-,", ",5", "007"])("de-DE allows typing %j", (input) => {
    expect(isValidPartialInput(input, "de-DE")).toBe(true);
  });

  test.each(["1.", "1.000", "12,5,", "a", " 1", "1-", "--", "1e", "+"])(
    "de-DE blocks %j",
    (input) => {
      expect(isValidPartialInput(input, "de-DE")).toBe(false);
    },
  );

  test("the separators follow the locale", () => {
    expect(isValidPartialInput("12.5", "en-US")).toBe(true);
    expect(isValidPartialInput("12,5", "en-US")).toBe(false);
  });

  test("options limit fraction digits and sign", () => {
    expect(isValidPartialInput("1,23", "de-DE", { maxFractionDigits: 2 })).toBe(true);
    expect(isValidPartialInput("1,234", "de-DE", { maxFractionDigits: 2 })).toBe(false);
    expect(isValidPartialInput("-", "de-DE", { allowNegative: false })).toBe(false);
    expect(isValidPartialInput("1,", "de-DE", { maxFractionDigits: 0 })).toBe(false);
  });

  test("every number can be typed key by key", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        const typed = format(value, locale, { useGrouping: false });
        for (let length = 0; length <= typed.length; length++) {
          expect(isValidPartialInput(typed.slice(0, length), locale)).toBe(true);
        }
      }),
      { numRuns: 300 },
    );
  });

  test("maxFractionDigits must be a valid digit count", () => {
    expect(errorCode(() => isValidPartialInput("1", "de-DE", { maxFractionDigits: 1.5 }))).toBe(
      "invalidOptions",
    );
  });
});
