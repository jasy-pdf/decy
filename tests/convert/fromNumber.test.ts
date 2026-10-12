import { describe, expect, test } from "vite-plus/test";
import { errorCode } from "../helpers/errorCode.ts";
import { fromNumber } from "../../src/convert/fromNumber.ts";
import { toDecimalString } from "../../src/convert/toDecimalString.ts";

function text(value: number): string {
  return toDecimalString(fromNumber(value));
}

describe("fromNumber", () => {
  test("uses the shortest exact text, never the binary expansion", () => {
    expect(text(1.005)).toBe("1.005");
    expect(text(2.675)).toBe("2.675");
    expect(text(0.1)).toBe("0.1");
  });

  test("keeps float garbage visible instead of hiding it", () => {
    expect(text(0.1 + 0.2)).toBe("0.30000000000000004");
  });

  test("expands exponent notation", () => {
    expect(text(1e21)).toBe("1000000000000000000000");
    expect(text(1.5e-7)).toBe("0.00000015");
    expect(text(-2.5e-7)).toBe("-0.00000025");
  });

  test("negative values and negative zero", () => {
    expect(text(-12.5)).toBe("-12.5");
    expect(text(-0)).toBe("0");
  });

  test.each([NaN, Infinity, -Infinity])("rejects %s", (value) => {
    expect(errorCode(() => fromNumber(value))).toBe("invalidNumber");
  });

  test("rejects numbers too small for the scale limit", () => {
    expect(errorCode(() => fromNumber(5e-324))).toBe("invalidScale");
  });
});
