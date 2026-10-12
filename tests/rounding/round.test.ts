import { describe, expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import type { RoundingMode } from "../../src/core/roundingMode.ts";
import { round } from "../../src/rounding/round.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

const inputs = ["2.5", "3.5", "-2.5", "-3.5", "2.4", "2.6", "-2.6", "2.1", "-2.1", "2.501", "2.0"];

// One row per mode, one column per input above, rounded to whole numbers.
const expected: [RoundingMode, string[]][] = [
  ["halfAwayFromZero", ["3", "4", "-3", "-4", "2", "3", "-3", "2", "-2", "3", "2"]],
  ["halfEven", ["2", "4", "-2", "-4", "2", "3", "-3", "2", "-2", "3", "2"]],
  ["towardZero", ["2", "3", "-2", "-3", "2", "2", "-2", "2", "-2", "2", "2"]],
  ["awayFromZero", ["3", "4", "-3", "-4", "3", "3", "-3", "3", "-3", "3", "2"]],
  ["floor", ["2", "3", "-3", "-4", "2", "2", "-3", "2", "-3", "2", "2"]],
  ["ceil", ["3", "4", "-2", "-3", "3", "3", "-2", "3", "-2", "3", "2"]],
];

describe("round", () => {
  test.each(expected)("%s across ties, signs and near-ties", (mode, results) => {
    const actual = inputs.map((input) => text(round(d(input), { scale: 0, mode })));
    expect(actual).toEqual(results);
  });

  // The cases where jasy's float round2 gives a wrong cent.
  test.each([
    ["1.005", "1.01"],
    ["2.675", "2.68"],
    ["10000.005", "10000.01"],
    ["-1.005", "-1.01"],
    ["-0.0025", "0.00"],
  ])("commercial rounding of %s to cents is %s", (input, result) => {
    expect(text(round(d(input), { scale: 2, mode: "halfAwayFromZero" }))).toBe(result);
  });

  test("a larger target scale pads instead of rounding", () => {
    expect(text(round(d("12.5"), { scale: 2, mode: "towardZero" }))).toBe("12.50");
    expect(text(round(d("12.50"), { scale: 2, mode: "towardZero" }))).toBe("12.50");
  });

  test.each([-1, 1.5, 31])("rejects scale %s with our own error", (scale) => {
    expect(errorCode(() => round(d("1.25"), { scale, mode: "halfEven" }))).toBe("invalidScale");
  });

  // Checked upfront: also when nothing needs rounding, so a bad mode from a config fails on day one.
  test.each([
    ["with a rest", "1.25", 1],
    ["without a rest", "1.20", 1],
    ["when only padding", "1.2", 2],
  ])("rejects an unknown mode %s", (_, input, scale) => {
    const mode = "halfUp" as RoundingMode;
    expect(errorCode(() => round(d(input), { scale, mode }))).toBe("invalidRoundingMode");
  });
});
