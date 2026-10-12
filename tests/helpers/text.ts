import type { Decimal } from "../../src/core/decimal.ts";
import { toDecimalString } from "../../src/convert/toDecimalString.ts";

/** Short form for assertions: compare results as canonical text, which also checks the scale. */
export function text(value: Decimal): string {
  return toDecimalString(value);
}
