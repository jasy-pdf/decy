import { expect, test } from "vite-plus/test";
import { min } from "../../src/compare/min.ts";
import { decimal as d } from "../../src/convert/decimal.ts";

test("picks by value, not by units", () => {
  expect(min(d("0.01"), d("0.001"))).toEqual(d("0.001"));
  expect(min(d("-1"), d("0.5"))).toEqual(d("-1"));
});

test("on a tie the first argument wins", () => {
  const first = d("12.50");
  expect(min(first, d("12.5"))).toBe(first);
});
