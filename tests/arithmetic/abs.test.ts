import { expect, test } from "vite-plus/test";
import { abs } from "../../src/arithmetic/abs.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { text } from "../helpers/text.ts";

test("removes the sign only from negatives", () => {
  expect(text(abs(d("-0.05")))).toBe("0.05");
  expect(text(abs(d("0.05")))).toBe("0.05");
  expect(text(abs(d("0")))).toBe("0");
});
