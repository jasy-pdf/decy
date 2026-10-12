import { expect, test } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import { percentageOf } from "../../src/division/percentageOf.ts";
import { text } from "../helpers/text.ts";

test("VAT on a price, exact and unrounded", () => {
  expect(text(percentageOf(d("8.40"), d("19")))).toBe("1.5960");
  expect(text(percentageOf(d("2.49"), d("7")))).toBe("0.1743");
});

test("fractional percentages", () => {
  expect(text(percentageOf(d("200"), d("2.5")))).toBe("5.000");
});

test("negative base, e.g. a credit note", () => {
  expect(text(percentageOf(d("-100.00"), d("19")))).toBe("-19.0000");
});
