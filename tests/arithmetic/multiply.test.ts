import { expect, test } from "vite-plus/test";
import { multiply } from "../../src/arithmetic/multiply.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

test("quantity times price", () => {
  expect(text(multiply(d("2.49"), d("12")))).toBe("29.88");
});

test("scales add up, nothing is rounded", () => {
  expect(text(multiply(d("0.5"), d("0.5")))).toBe("0.25");
  expect(text(multiply(d("1.10"), d("3")))).toBe("3.30");
  expect(text(multiply(d("8.40"), d("0.19")))).toBe("1.5960");
});

test("signs", () => {
  expect(text(multiply(d("-2"), d("-0.5")))).toBe("1.0");
  expect(text(multiply(d("-2"), d("0.5")))).toBe("-1.0");
});

test("fails loudly when the combined scale exceeds the limit", () => {
  const tiny = d(`0.${"0".repeat(15)}1`);
  expect(text(multiply(tiny, d("0.1")))).toBe(`0.${"0".repeat(16)}1`);
  expect(errorCode(() => multiply(tiny, tiny))).toBe("invalidScale");
});
