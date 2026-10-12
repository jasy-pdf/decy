import { describe, expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import type { RoundingMode } from "../../src/core/roundingMode.ts";
import { divide } from "../../src/division/divide.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

describe("divide", () => {
  test("rounds once, by the given mode", () => {
    expect(text(divide(d("10"), d("3"), { scale: 2, mode: "halfAwayFromZero" }))).toBe("3.33");
    expect(text(divide(d("10"), d("3"), { scale: 2, mode: "ceil" }))).toBe("3.34");
  });

  test("an exact tie is decided by the mode", () => {
    expect(text(divide(d("1"), d("8"), { scale: 3, mode: "halfEven" }))).toBe("0.125");
    expect(text(divide(d("1"), d("8"), { scale: 2, mode: "halfEven" }))).toBe("0.12");
    expect(text(divide(d("1"), d("8"), { scale: 2, mode: "halfAwayFromZero" }))).toBe("0.13");
  });

  test("mixed scales on both sides", () => {
    expect(text(divide(d("29.88"), d("12"), { scale: 2, mode: "halfEven" }))).toBe("2.49");
    expect(text(divide(d("1.5"), d("0.25"), { scale: 0, mode: "halfEven" }))).toBe("6");
    expect(text(divide(d("1.5"), d("0.25"), { scale: 2, mode: "halfEven" }))).toBe("6.00");
    expect(text(divide(d("0.001"), d("3"), { scale: 5, mode: "halfEven" }))).toBe("0.00033");
  });

  test("signs on either side", () => {
    expect(text(divide(d("-10"), d("3"), { scale: 2, mode: "halfAwayFromZero" }))).toBe("-3.33");
    expect(text(divide(d("10"), d("-3"), { scale: 2, mode: "floor" }))).toBe("-3.34");
    expect(text(divide(d("-10"), d("-4"), { scale: 0, mode: "halfAwayFromZero" }))).toBe("3");
  });

  test("division by zero at any scale fails loudly", () => {
    expect(errorCode(() => divide(d("1"), d("0.00"), { scale: 2, mode: "halfEven" }))).toBe(
      "divisionByZero",
    );
  });

  test("rejects a bad scale with our own error", () => {
    expect(errorCode(() => divide(d("1"), d("3"), { scale: 1.5, mode: "halfEven" }))).toBe(
      "invalidScale",
    );
  });

  test("rejects an unknown mode even when the division is exact", () => {
    const mode = "halfUp" as RoundingMode;
    expect(errorCode(() => divide(d("4"), d("2"), { scale: 0, mode }))).toBe("invalidRoundingMode");
  });
});
