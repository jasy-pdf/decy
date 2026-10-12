import { describe, expect, test } from "vite-plus/test";
import { decimal } from "../../src/convert/decimal.ts";
import { toDecimalString } from "../../src/convert/toDecimalString.ts";

describe("toDecimalString", () => {
  test.each([
    "0",
    "0.00",
    "12.50",
    "-12.50",
    "-0.05",
    "0.005",
    "1000",
    "123456789012345678901234567890.123456789012345678901234567890",
  ])("round-trips %j exactly", (text) => {
    expect(toDecimalString(decimal(text))).toBe(text);
  });

  test("never writes a negative zero", () => {
    expect(toDecimalString(decimal("-0.00"))).toBe("0.00");
  });
});
