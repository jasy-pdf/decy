import { expect, test } from "vite-plus/test";
import { fromBigInt } from "../../src/convert/fromBigInt.ts";

test("fromBigInt creates a whole number", () => {
  expect(fromBigInt(12n)).toEqual({ units: 12n, scale: 0 });
  expect(fromBigInt(-3n)).toEqual({ units: -3n, scale: 0 });
});
