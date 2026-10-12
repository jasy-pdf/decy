import { expect, test } from "vite-plus/test";
import { divideRounded } from "../../src/core/divideRounded.ts";
import { errorCode } from "../helpers/errorCode.ts";

// round and roundToStep only divide by positive powers or steps; divide (a / b) can pass a negative b.
test("a negative denominator flips the direction", () => {
  expect(divideRounded(7n, -2n, "halfAwayFromZero")).toBe(-4n);
  expect(divideRounded(7n, -2n, "floor")).toBe(-4n);
  expect(divideRounded(7n, -2n, "ceil")).toBe(-3n);
  expect(divideRounded(-7n, -2n, "floor")).toBe(3n);
});

test("division by zero fails loudly", () => {
  expect(errorCode(() => divideRounded(1n, 0n, "halfEven"))).toBe("divisionByZero");
});
