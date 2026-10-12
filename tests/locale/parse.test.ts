import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import { MAX_SCALE } from "../../src/core/scale.ts";
import { format } from "../../src/locale/format.ts";
import { parse, type ParseResult } from "../../src/locale/parse.ts";
import { anyDecimal, locales } from "../helpers/arbitraries.ts";
import { NO_BREAK_SPACE } from "../helpers/chars.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

function parsed(result: ParseResult): string {
  return result.ok ? text(result.value) : `error: ${result.error}`;
}

describe("parse", () => {
  test.each([
    ["de-DE", "12,50", "12.50"],
    ["en-US", "12.50", "12.50"],
    ["de-DE", "1.234,5", "1234.5"],
    ["de-DE", "1.234.567", "1234567"],
    ["de-DE", "1.234,", "1234"],
    ["en-US", "1,234.5", "1234.5"],
    ["en-IN", "1,23,456.5", "123456.5"],
    ["de-DE", "-0,05", "-0.05"],
    ["de-DE", " 12 ", "12"],
    ["de-DE", "007", "7"],
    ["de-DE", "1,", "1"],
    ["de-DE", ",5", "0.5"],
  ])("%s reads %j as %s", (locale, input, result) => {
    expect(parsed(parse(input, locale))).toBe(result);
  });

  // Every row is a way to silently get a wrong number. All must be errors, none may be guessed.
  test.each([
    ["de-DE", "12.50", "invalidGrouping"],
    ["de-DE", "2.5", "invalidGrouping"],
    ["de-DE", "1..2", "invalidGrouping"],
    ["de-DE", "0.123", "invalidGrouping"],
    ["de-DE", "1,2.3", "invalidGrouping"],
    ["en-US", "2,5", "invalidGrouping"],
    ["en-IN", "123,456", "invalidGrouping"],
    ["de-DE", "1e5", "invalidCharacter"],
    ["de-DE", "+1", "invalidCharacter"],
    ["de-DE", "1 000", "invalidCharacter"],
    ["de-DE", "--1", "invalidCharacter"],
    ["de-DE", "1-", "invalidCharacter"],
    ["de-DE", "12€", "invalidCharacter"],
    ["de-DE", "١٢", "invalidCharacter"],
    ["de-DE", "1,2,3", "multipleDecimalSeparators"],
    // One grouping separator and no decimal part: 1.234 could be 1234 or 1,234 (numpad dot). Never guess.
    ["de-DE", "1.234", "ambiguousGrouping"],
    ["de-DE", "12.345", "ambiguousGrouping"],
    ["en-US", "1,234", "ambiguousGrouping"],
    ["en-IN", "12,345", "ambiguousGrouping"],
    ["de-DE", "", "empty"],
    ["de-DE", "   ", "empty"],
    ["de-DE", "-", "incomplete"],
    ["de-DE", ",", "incomplete"],
  ])("%s refuses %j: %s", (locale, input, error) => {
    expect(parsed(parse(input, locale))).toBe(`error: ${error}`);
  });

  test("options limit fraction digits and sign", () => {
    expect(parsed(parse("1,23", "de-DE", { maxFractionDigits: 2 }))).toBe("1.23");
    expect(parsed(parse("1,234", "de-DE", { maxFractionDigits: 2 }))).toBe(
      "error: tooManyFractionDigits",
    );
    expect(parsed(parse("-1", "de-DE", { allowNegative: false }))).toBe(
      "error: negativeNotAllowed",
    );
  });

  test("too many digits for a Decimal is an input error, not a crash", () => {
    expect(parsed(parse(`0,${"1".repeat(MAX_SCALE + 1)}`, "de-DE"))).toBe(
      "error: tooManyFractionDigits",
    );
  });

  test("reads back everything it formats without grouping, in every locale", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        expect(parsed(parse(format(value, locale, { useGrouping: false }), locale))).toBe(
          text(value),
        );
      }),
      { numRuns: 1000 },
    );
  });

  test("grouped output reads back exactly or is refused as ambiguous, never as another number", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        const result = parsed(parse(format(value, locale), locale));
        expect([text(value), "error: ambiguousGrouping"]).toContain(result);
      }),
      { numRuns: 1000 },
    );
  });

  test("right-to-left locales: the invisible direction mark before the minus is ignored", () => {
    for (const locale of ["ar", "he", "fa", "ur"]) {
      expect(parsed(parse(format(d("-1234.5"), locale), locale))).toBe("-1234.5");
    }
  });

  test.each([-1, 1.5, 31])(
    "maxFractionDigits %s is a programmer error, not a user error",
    (maxFractionDigits) => {
      expect(errorCode(() => parse("1", "de-DE", { maxFractionDigits }))).toBe("invalidOptions");
    },
  );

  test("never throws, whatever the user types", () => {
    fc.assert(
      fc.property(
        fc.string({ unit: fc.constantFrom(..."0123456789,.-+ e’'".split(""), NO_BREAK_SPACE) }),
        (input) => {
          expect(typeof parse(input, "de-DE").ok).toBe("boolean");
        },
      ),
      { numRuns: 1000 },
    );
  });
});
