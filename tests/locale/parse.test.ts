import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { MAX_SCALE } from "../../src/core/scale.ts";
import { format } from "../../src/locale/format.ts";
import { parse, type ParseResult } from "../../src/locale/parse.ts";
import { anyDecimal, locales } from "../helpers/arbitraries.ts";
import { NO_BREAK_SPACE } from "../helpers/chars.ts";
import { text } from "../helpers/text.ts";

function parsed(result: ParseResult): string {
  return result.ok ? text(result.value) : `error: ${result.error}`;
}

describe("parse", () => {
  test.each([
    ["de-DE", "12,50", "12.50"],
    ["en-US", "12.50", "12.50"],
    ["de-DE", "1.234,5", "1234.5"],
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

  test("reads back everything it formats, in every locale", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        expect(parsed(parse(format(value, locale), locale))).toBe(text(value));
      }),
      { numRuns: 500 },
    );
  });

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
