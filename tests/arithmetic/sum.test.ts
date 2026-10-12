import { expect, test } from "vite-plus/test";
import { sum } from "../../src/arithmetic/sum.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { text } from "../helpers/text.ts";

test("an empty list is zero", () => {
  expect(text(sum([]))).toBe("0");
});

test("ten times 0.1 is exactly 1", () => {
  expect(text(sum(Array.from({ length: 10 }, () => d("0.1"))))).toBe("1.0");
});

test("mixed scales and signs", () => {
  expect(text(sum([d("12.50"), d("-0.005"), d("3")]))).toBe("15.495");
});
