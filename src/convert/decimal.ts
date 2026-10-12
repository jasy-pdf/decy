import { createDecimal, type Decimal } from "../core/decimal.ts";
import { DecyError } from "../core/errors.ts";

// Plain decimal text as databases and APIs exchange it. Leading zeros are just zeros: "007" is 7.
// User input with locale separators goes through the locale parser.
const PLAIN_DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

/** Creates a Decimal from plain decimal text, e.g. "12.50", "-0.05" or "007". */
export function decimal(text: string): Decimal {
  const match = PLAIN_DECIMAL.exec(text);
  if (!match) {
    throw new DecyError("invalidDecimal", `Not a plain decimal: "${text}".`);
  }
  const [, sign, integer, fraction = ""] = match;
  const units = BigInt(`${sign}${integer}${fraction}`);
  return createDecimal(units, fraction.length);
}
