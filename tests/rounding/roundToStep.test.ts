import { describe, expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import type { RoundingMode } from "../../src/core/roundingMode.ts";
import { roundToStep } from "../../src/rounding/roundToStep.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

describe("roundToStep", () => {
  test("Swiss cash rounding to 0.05", () => {
    expect(text(roundToStep(d("1.234"), d("0.05"), "halfAwayFromZero"))).toBe("1.25");
    expect(text(roundToStep(d("1.224"), d("0.05"), "halfAwayFromZero"))).toBe("1.20");
    expect(text(roundToStep(d("-1.234"), d("0.05"), "halfAwayFromZero"))).toBe("-1.25");
  });

  test("a tie between two steps follows the mode", () => {
    expect(text(roundToStep(d("1.225"), d("0.05"), "halfAwayFromZero"))).toBe("1.25");
    expect(text(roundToStep(d("1.225"), d("0.05"), "halfEven"))).toBe("1.20");
  });

  test("10 g steps in kg keep the scale of the step", () => {
    expect(text(roundToStep(d("1.2345"), d("0.010"), "halfAwayFromZero"))).toBe("1.230");
    expect(text(roundToStep(d("1.2345"), d("0.010"), "ceil"))).toBe("1.240");
  });

  test("steps above one and finer than the value", () => {
    expect(text(roundToStep(d("37"), d("5"), "halfAwayFromZero"))).toBe("35");
    expect(text(roundToStep(d("37.5"), d("5"), "halfAwayFromZero"))).toBe("40");
    expect(text(roundToStep(d("1.2"), d("0.25"), "halfAwayFromZero"))).toBe("1.25");
  });

  test.each(["0", "0.00", "-0.05"])("rejects step %s", (step) => {
    expect(errorCode(() => roundToStep(d("1"), d(step), "halfEven"))).toBe("invalidStep");
  });

  test("rejects an unknown mode even on an exact step", () => {
    const mode = "halfUp" as RoundingMode;
    expect(errorCode(() => roundToStep(d("1.25"), d("0.05"), mode))).toBe("invalidRoundingMode");
  });
});
