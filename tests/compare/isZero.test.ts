import { expect, test } from "vite-plus/test";
import { isZero } from "../../src/compare/isZero.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("only zero is zero, at any scale", () => {
  expect(isZero(d("0.000"))).toBe(true);
  expect(isZero(d("0.001"))).toBe(false);
  expect(isZero(d("-0.001"))).toBe(false);
});
