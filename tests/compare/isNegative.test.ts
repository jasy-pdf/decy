import { expect, test } from "vite-plus/test";
import { isNegative } from "../../src/compare/isNegative.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("strictly below zero", () => {
  expect(isNegative(d("-0.001"))).toBe(true);
  expect(isNegative(d("0"))).toBe(false);
  expect(isNegative(d("-0.00"))).toBe(false);
  expect(isNegative(d("0.001"))).toBe(false);
});
