import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { allocate } from "../../src/allocation/allocate.ts";
import { decimal as d } from "../../src/convert/decimal.ts";
import { createDecimal } from "../../src/core/decimal.ts";
import { errorCode } from "../helpers/errorCode.ts";
import { text } from "../helpers/text.ts";

function texts(parts: { units: bigint; scale: number }[]): string[] {
  return parts.map((part) => text(createDecimal(part.units, part.scale)));
}

describe("allocate", () => {
  test("equal parts: the leftover cent goes to the first part", () => {
    expect(texts(allocate(d("10.00"), [d("1"), d("1"), d("1")], { scale: 2 }))).toEqual([
      "3.34",
      "3.33",
      "3.33",
    ]);
  });

  test("the leftover goes to the largest remainder, not simply to the first", () => {
    // Exact shares 33.333.. and 66.666..: the second part is closer to rounding up.
    expect(texts(allocate(d("100"), [d("1"), d("2")], { scale: 2 }))).toEqual(["33.33", "66.67"]);
    // 3:4 of 1.00 is 0.4285.. and 0.5714..: the smaller ratio has the larger remainder and gets the cent.
    expect(texts(allocate(d("1.00"), [d("3"), d("4")], { scale: 2 }))).toEqual(["0.43", "0.57"]);
  });

  test("negative totals mirror positive ones", () => {
    expect(texts(allocate(d("-10.00"), [d("1"), d("1"), d("1")], { scale: 2 }))).toEqual([
      "-3.34",
      "-3.33",
      "-3.33",
    ]);
  });

  test("a zero ratio never receives anything, not even a leftover", () => {
    expect(texts(allocate(d("0.01"), [d("1"), d("0"), d("1")], { scale: 2 }))).toEqual([
      "0.01",
      "0.00",
      "0.00",
    ]);
    expect(texts(allocate(d("1.00"), [d("0"), d("1"), d("1")], { scale: 2 }))).toEqual([
      "0.00",
      "0.50",
      "0.50",
    ]);
  });

  test("ratios may have decimals and different scales", () => {
    expect(texts(allocate(d("1.00"), [d("0.5"), d("0.25")], { scale: 2 }))).toEqual([
      "0.67",
      "0.33",
    ]);
  });

  test("a finer target scale than the total is fine, a coarser one is refused", () => {
    expect(texts(allocate(d("10"), [d("1"), d("1"), d("1")], { scale: 2 }))).toEqual([
      "3.34",
      "3.33",
      "3.33",
    ]);
    expect(errorCode(() => allocate(d("10.005"), [d("1")], { scale: 2 }))).toBe("invalidScale");
  });

  test.each([
    ["no ratios", []],
    ["a negative ratio", [d("-1"), d("2")]],
    ["only zero ratios", [d("0"), d("0.00")]],
  ])("rejects %s", (_, ratios) => {
    expect(errorCode(() => allocate(d("1"), ratios, { scale: 0 }))).toBe("invalidRatios");
  });

  // Laws, checked against random input: nothing lost, nothing invented, no part off by more than one unit.
  test("parts always sum to the total and stay within one unit of their exact share", () => {
    const ratioList = fc
      .array(fc.bigInt({ min: 0n, max: 1000n }), { minLength: 1, maxLength: 12 })
      .filter((weights) => weights.some((weight) => weight > 0n));

    fc.assert(
      fc.property(
        fc.bigInt({ min: -(10n ** 15n), max: 10n ** 15n }),
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 0, max: 3 }),
        ratioList,
        (units, totalScale, extraScale, weights) => {
          const scale = totalScale + extraScale;
          const parts = allocate(
            createDecimal(units, totalScale),
            weights.map((weight) => createDecimal(weight, 0)),
            { scale },
          );
          const amount = units * 10n ** BigInt(extraScale);
          const weightSum = weights.reduce((sum, weight) => sum + weight, 0n);

          expect(parts).toHaveLength(weights.length);
          expect(parts.every((part) => part.scale === scale)).toBe(true);
          expect(parts.reduce((sum, part) => sum + part.units, 0n)).toBe(amount);
          parts.forEach((part, index) => {
            const distance = part.units * weightSum - amount * weights[index]!;
            expect(distance < weightSum && distance > -weightSum).toBe(true);
          });
        },
      ),
      { numRuns: 1000 },
    );
  });
});
