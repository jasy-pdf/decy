import { expect, test } from "vite-plus/test";
import { add } from "../../src/arithmetic/add.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { text } from "../helpers/text.ts";

test("aligns scales and keeps the larger one", () => {
  expect(text(add(d("1.5"), d("2.25")))).toBe("3.75");
  expect(text(add(d("12.50"), d("1")))).toBe("13.50");
});

test("is exact where floats fail", () => {
  expect(text(add(d("0.1"), d("0.2")))).toBe("0.3");
});

test("crosses zero with mixed signs", () => {
  expect(text(add(d("-1.5"), d("0.25")))).toBe("-1.25");
  expect(text(add(d("0.05"), d("-0.10")))).toBe("-0.05");
});

test("stays exact beyond Number.MAX_SAFE_INTEGER", () => {
  expect(text(add(d("9007199254740993"), d("0.01")))).toBe("9007199254740993.01");
});
