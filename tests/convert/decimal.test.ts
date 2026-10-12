import { describe, expect, test } from "vite-plus/test";
import { MAX_SCALE } from "../../src/core/scale.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { decimal } from "../../src/convert/decimal.ts";

describe("decimal", () => {
  test("keeps the scale written in the text", () => {
    expect(decimal("12.50")).toEqual({ units: 1250n, scale: 2 });
    expect(decimal("12.5")).toEqual({ units: 125n, scale: 1 });
    expect(decimal("12")).toEqual({ units: 12n, scale: 0 });
  });

  test("negative values, also below one", () => {
    expect(decimal("-0.05")).toEqual({ units: -5n, scale: 2 });
    expect(decimal("-12.50")).toEqual({ units: -1250n, scale: 2 });
  });

  test("leading zeros are just zeros", () => {
    expect(decimal("007")).toEqual({ units: 7n, scale: 0 });
    expect(decimal("-00.50")).toEqual({ units: -50n, scale: 2 });
    expect(decimal("000")).toEqual({ units: 0n, scale: 0 });
  });

  test("negative zero becomes zero", () => {
    expect(decimal("-0.00")).toEqual({ units: 0n, scale: 2 });
  });

  // Every row breaks exactly one rule of the plain decimal grammar.
  test.each([
    ["", "empty"],
    [" 1", "leading space"],
    ["1 ", "trailing space"],
    ["- 1", "space after minus"],
    ["+1", "plus sign"],
    ["--1", "double minus"],
    ["-", "minus alone"],
    ["1,5", "comma as decimal separator"],
    ["1,000", "grouping separator"],
    ["1_000", "numeric separator"],
    [".5", "missing integer part"],
    ["5.", "missing fraction part"],
    ["1.2.3", "two decimal points"],
    ["1e5", "exponent"],
    ["0x10", "hex"],
    ["١٢", "non-latin digits"],
    ["NaN", "NaN"],
    ["Infinity", "Infinity"],
  ])("rejects %j (%s)", (text) => {
    expect(errorCode(() => decimal(text))).toBe("invalidDecimal");
  });

  test(`scale limit is exactly ${MAX_SCALE}`, () => {
    expect(decimal(`0.${"1".repeat(MAX_SCALE)}`).scale).toBe(MAX_SCALE);
    expect(errorCode(() => decimal(`0.${"1".repeat(MAX_SCALE + 1)}`))).toBe("invalidScale");
  });

  test("is immutable", () => {
    const value = decimal("1.00") as { units: bigint };
    expect(() => {
      value.units = 2n;
    }).toThrow(TypeError);
  });
});
