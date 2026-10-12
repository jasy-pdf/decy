import { describe, expect, test, vi } from "vite-plus/test";
import { decimal as d } from "../../src/convert/decimal.ts";
import { format, type FormatOptions } from "../../src/locale/format.ts";
import { NO_BREAK_SPACE } from "../helpers/chars.ts";
import { errorCode } from "../helpers/errorCode.ts";

describe("format", () => {
  test("separators per locale", () => {
    expect(format(d("1234.50"), "de-DE")).toBe("1.234,50");
    expect(format(d("1234.50"), "en-US")).toBe("1,234.50");
    expect(format(d("-0.05"), "de-DE")).toBe("-0,05");
  });

  test("currency and unit", () => {
    expect(format(d("1234.50"), "de-DE", { style: "currency", currency: "EUR" })).toBe(
      `1.234,50${NO_BREAK_SPACE}€`,
    );
    expect(format(d("1234.50"), "en-US", { style: "currency", currency: "EUR" })).toBe("€1,234.50");
    expect(format(d("25.5"), "de-DE", { style: "unit", unit: "kilogram" })).toBe("25,5 kg");
  });

  test("never rounds, not even for currencies: it shows the value's own digits", () => {
    expect(format(d("2.675"), "de-DE", { style: "currency", currency: "EUR" })).toBe(
      `2,675${NO_BREAK_SPACE}€`,
    );
    expect(format(d("12"), "de-DE", { style: "currency", currency: "EUR" })).toBe(
      `12${NO_BREAK_SPACE}€`,
    );
  });

  test("exact far beyond float precision", () => {
    expect(format(d("123456789012345678901234567890.12"), "en-US")).toBe(
      "123,456,789,012,345,678,901,234,567,890.12",
    );
  });

  test("grouping can be switched off", () => {
    expect(format(d("1234.5"), "de-DE", { useGrouping: false })).toBe("1234,5");
  });

  // JS callers can pass anything; options that would change digits or are unknown must fail with the right reason.
  test.each([
    ["percent multiplies by 100", { style: "percent" }],
    ["digit options belong to the value's scale", { minimumIntegerDigits: 3 }],
    ["rounding options belong to round()", { roundingMode: "ceil" }],
  ])("refuses %s", (_, options) => {
    expect(errorCode(() => format(d("1.5"), "de-DE", options as FormatOptions))).toBe(
      "invalidIntlOptions",
    );
  });

  test("bad Intl options fail with our error", () => {
    expect(errorCode(() => format(d("1"), "de-DE", { style: "currency" }))).toBe(
      "invalidIntlOptions",
    );
  });

  test("refuses to show a wrong number on engines that turn strings into floats", () => {
    // oxlint-disable-next-line typescript/unbound-method -- called with its own `this` below
    const original = Intl.NumberFormat.prototype.formatToParts;
    const lossy = vi
      .spyOn(Intl.NumberFormat.prototype, "formatToParts")
      .mockImplementation(function (this: Intl.NumberFormat, value) {
        return original.call(this, Number(value));
      });
    try {
      expect(errorCode(() => format(d("123456789012345678901234567890.12"), "en-US"))).toBe(
        "unsupportedEnvironment",
      );
    } finally {
      lossy.mockRestore();
    }
  });
});
