import { expect, test } from "vite-plus/test";
import { subtract } from "../../src/arithmetic/subtract.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { text } from "../helpers/text.ts";

test("is exact where floats fail", () => {
  expect(text(subtract(d("1"), d("0.99")))).toBe("0.01");
  expect(text(subtract(d("0.3"), d("0.1")))).toBe("0.2");
});

test("order matters and the result can go negative", () => {
  expect(text(subtract(d("1.00"), d("2.5")))).toBe("-1.50");
  expect(text(subtract(d("2.5"), d("1.00")))).toBe("1.50");
});
