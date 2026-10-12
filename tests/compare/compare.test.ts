import { expect, test } from "vite-plus/test";
import { compare } from "../../src/compare/compare.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("compares values, not units", () => {
  // Same units (1), different scale: 0.001 < 0.01.
  expect(compare(d("0.001"), d("0.01"))).toBe(-1);
  expect(compare(d("0.01"), d("0.001"))).toBe(1);
});

test("the scale does not make values different", () => {
  expect(compare(d("12.5"), d("12.50"))).toBe(0);
});

test("negative values", () => {
  expect(compare(d("-1"), d("0.5"))).toBe(-1);
  expect(compare(d("-0.5"), d("-1"))).toBe(1);
});

test("works as a sort comparator", () => {
  const sorted = [d("2"), d("-0.5"), d("0.25"), d("10")].sort(compare).map((value) => value.units);
  expect(sorted).toEqual([-5n, 25n, 2n, 10n]);
});
