import { expect, test } from "vite-plus/test";
import { max } from "../../src/compare/max.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("picks by value, not by units", () => {
  expect(max(d("0.001"), d("0.01"))).toEqual(d("0.01"));
  expect(max(d("-1"), d("0.5"))).toEqual(d("0.5"));
});

test("on a tie the first argument wins", () => {
  const first = d("12.50");
  expect(max(first, d("12.5"))).toBe(first);
});
