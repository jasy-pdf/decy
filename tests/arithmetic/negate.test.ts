import { expect, test } from "vite-plus/test";
import { negate } from "../../src/arithmetic/negate.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { text } from "../helpers/text.ts";

test("flips the sign and keeps the scale", () => {
  expect(text(negate(d("-0.05")))).toBe("0.05");
  expect(text(negate(d("12.50")))).toBe("-12.50");
});

test("zero stays zero", () => {
  expect(text(negate(d("0.00")))).toBe("0.00");
});
