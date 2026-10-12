import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import { MAX_SCALE } from "../../src/core/scale.ts";
import { format } from "../../src/locale/format.ts";
import { localeSymbols } from "../../src/locale/localeSymbols.ts";
import { parse, type ParseResult } from "../../src/locale/parse.ts";
import { anyDecimal, locales, runtimeLanguages } from "../helpers/arbitraries.ts";
import {
  FIGURE_SPACE,
  NARROW_NO_BREAK_SPACE,
  NO_BREAK_SPACE,
  THIN_SPACE,
} from "../helpers/chars.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

function parsed(result: ParseResult): string {
  return result.ok ? text(result.value) : `error: ${result.error}`;
}

const grouping = { allowGrouping: true };

describe("parse, default: what a form field gets (grouping is never typed)", () => {
  test.each([
    ["de-DE", "12,50", "12.50"],
    ["en-US", "12.50", "12.50"],
    ["de-DE", "-0,05", "-0.05"],
    ["de-DE", " 12 ", "12"],
    ["de-DE", "007", "7"],
    ["de-DE", "1,", "1"],
    ["de-DE", ",5", "0.5"],
    ["de-DE", "1234567,8", "1234567.8"],
  ])("%s reads %j as %s", (locale, input, result) => {
    expect(parsed(parse(input, locale))).toBe(result);
  });

  // Every row is a way to silently get a wrong number. All must be errors, none may be guessed.
  test.each([
    // "1.234.567" meant as 1234,567 typed with the numpad dot: indistinguishable from grouping, so grouping is refused.
    ["de-DE", "1.234.567", "groupingNotAllowed"],
    ["de-DE", "1.234,5", "groupingNotAllowed"],
    ["de-DE", "1.234", "groupingNotAllowed"],
    ["de-DE", "12.50", "groupingNotAllowed"],
    ["en-US", "2,5", "groupingNotAllowed"],
    ["fr-FR", "12 345", "groupingNotAllowed"],
    ["de-DE", "1,2.3", "invalidGrouping"],
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

  test("only a real true enables grouping", () => {
    const truthy = { allowGrouping: "yes" } as unknown as { allowGrouping: boolean };
    expect(parsed(parse("1.234,5", "de-DE", truthy))).toBe("error: groupingNotAllowed");
  });
});

describe("parse, allowGrouping: what paste and import get", () => {
  test.each([
    ["de-DE", "1.234,5", "1234.5"],
    ["de-DE", "1.234.567", "1234567"],
    ["de-DE", "1.234,", "1234"],
    ["en-US", "1,234.5", "1234.5"],
    ["en-IN", "1,23,456.5", "123456.5"],
    ["de-CH", "12'345", "12345"],
    // Groups of two: the grouping rule comes from Intl, not from a hard-coded three.
    ["tok", "1 23 45 67,5", "1234567.5"],
    ["de-AT", `12 345,5`, "12345.5"],
  ])("%s reads %j as %s", (locale, input, result) => {
    expect(parsed(parse(input, locale, grouping))).toBe(result);
  });

  // A space can never be a decimal key: in space-grouping locales any space groups, and one alone is not ambiguous.
  test.each([
    ["narrow no-break space", NARROW_NO_BREAK_SPACE],
    ["no-break space", NO_BREAK_SPACE],
    ["plain space", " "],
    ["thin space", THIN_SPACE],
    ["figure space (typesetting, PDF exports)", FIGURE_SPACE],
  ])("fr-FR groups with a %s", (_, space) => {
    expect(parsed(parse(`12${space}345`, "fr-FR", grouping))).toBe("12345");
  });

  test.each([
    ["de-DE", "12.50", "invalidGrouping"],
    ["de-DE", "2.5", "invalidGrouping"],
    ["de-DE", "1..2", "invalidGrouping"],
    ["de-DE", "0.123", "invalidGrouping"],
    ["en-IN", "123,456", "invalidGrouping"],
    ["de-CH", "12'34", "invalidGrouping"],
    // One "." or "," and no decimal part: 1.234 could be 1234 or 1,234 (numpad dot). Never guess.
    ["de-DE", "1.234", "ambiguousGrouping"],
    ["de-DE", "12.345", "ambiguousGrouping"],
    ["en-US", "1,234", "ambiguousGrouping"],
    ["en-IN", "12,345", "ambiguousGrouping"],
    // Spaces only group in locales that group with a space.
    ["de-DE", "12 345", "invalidCharacter"],
  ])("%s refuses %j: %s", (locale, input, error) => {
    expect(parsed(parse(input, locale, grouping))).toBe(`error: ${error}`);
  });
});

describe("parse, laws", () => {
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

  test("default: grouped output reads back exactly or is refused, never as another number", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        const result = parsed(parse(format(value, locale), locale));
        expect([text(value), "error: groupingNotAllowed"]).toContain(result);
      }),
      { numRuns: 1000 },
    );
  });

  test("allowGrouping: exact, or ambiguous only where the separator is '.' or ','", () => {
    fc.assert(
      fc.property(anyDecimal, fc.constantFrom(...locales), (value, locale) => {
        const result = parsed(parse(format(value, locale), locale, grouping));
        const canBeAmbiguous = [".", ","].includes(localeSymbols(locale).group);
        expect(
          canBeAmbiguous ? [text(value), "error: ambiguousGrouping"] : [text(value)],
        ).toContain(result);
      }),
      { numRuns: 1000 },
    );
  });

  test("right-to-left locales: the invisible direction mark before the minus is ignored", () => {
    for (const locale of ["ar", "he", "fa", "ur"]) {
      expect(parsed(parse(format(d("-1234.5"), locale), locale, grouping))).toBe("-1234.5");
    }
  });

  test("never throws, whatever the user types, in any language of the runtime", () => {
    const languages = runtimeLanguages();
    const input = fc.string({
      unit: fc.constantFrom(
        ..."0123456789,.-+ e’'".split(""),
        NO_BREAK_SPACE,
        NARROW_NO_BREAK_SPACE,
      ),
    });
    fc.assert(
      fc.property(
        input,
        fc.constantFrom(...languages),
        fc.boolean(),
        (typed, language, allowGrouping) => {
          expect(typeof parse(typed, language, { allowGrouping }).ok).toBe("boolean");
        },
      ),
      { numRuns: 2000 },
    );
  });
});

describe("parse, options", () => {
  test("limit fraction digits and sign", () => {
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

  test.each([-1, 1.5, 31])(
    "maxFractionDigits %s is a programmer error, not a user error",
    (maxFractionDigits) => {
      expect(errorCode(() => parse("1", "de-DE", { maxFractionDigits }))).toBe("invalidOptions");
    },
  );
});
