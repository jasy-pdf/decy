import { createDecimal, type Decimal } from "../core/decimal.ts";
import { DecyError } from "../core/errors.ts";

// String(number) yields the shortest text that round-trips, sometimes with an exponent ("1e+21", "1.5e-7").
const NUMBER_TEXT = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/;

/**
 * Creates a Decimal from a JavaScript number, using its shortest exact text:
 * 1.005 becomes 1.005, not the binary 1.00499999999999989...
 */
export function fromNumber(value: number): Decimal {
  if (!Number.isFinite(value)) {
    throw new DecyError("invalidNumber", `Not a finite number: ${value}.`);
  }
  const [, sign, integer, fraction = "", exponent = "0"] = NUMBER_TEXT.exec(String(value))!;
  const units = BigInt(`${sign}${integer}${fraction}`);
  const scale = fraction.length - Number(exponent);

  if (scale < 0) return createDecimal(units * 10n ** BigInt(-scale), 0);
  return createDecimal(units, scale);
}
