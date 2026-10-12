import { expect, test } from "vite-plus/test";
import { equals } from "../../src/compare/equals.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("equal in value regardless of scale", () => {
  expect(equals(d("12.5"), d("12.50"))).toBe(true);
  expect(equals(d("0"), d("-0.00"))).toBe(true);
});

test("close is not equal", () => {
  expect(equals(d("1.01"), d("1.1"))).toBe(false);
});
