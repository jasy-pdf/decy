import type { Decimal } from "../core/decimal.ts";

/** The canonical text of a Decimal, keeping its scale: "12.50", "-0.05", "0". */
export function toDecimalString(value: Decimal): string {
  const isNegative = value.units < 0n;
  const digits = (isNegative ? -value.units : value.units)
    .toString()
    .padStart(value.scale + 1, "0");
  const sign = isNegative ? "-" : "";

  if (value.scale === 0) return `${sign}${digits}`;
  const integer = digits.slice(0, -value.scale);
  const fraction = digits.slice(-value.scale);
  return `${sign}${integer}.${fraction}`;
}
