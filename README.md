# decy

**DECimal easY**: exact decimal math for money and quantities in TypeScript.

- **Exact.** No binary floats anywhere a result is produced. `0.1 + 0.2` is `0.3`.
- **Rounds only when you say so,** with a named mode. Never implicitly.
- **Reads user input strictly per locale.** `"12.50"` in German is an error, not 1250. Ambiguous input is refused, never guessed.
- **Splits amounts without losing a cent.** 10.00 in three parts is 3.34 + 3.33 + 3.33.
- **Tree-shakable, zero dependencies,** one small function per file. Runs in Node and every modern browser.

```sh
npm install decy
```

## Quick start

```ts
import { decimal, format, multiply, round } from "decy";

const net = round(multiply(decimal("2.49"), decimal("12")), { scale: 2, mode: "halfAwayFromZero" });

format(net, "de-DE", { style: "currency", currency: "EUR" }); // "29,88 €"
```

## The value

A `Decimal` is a frozen plain object `{ units: bigint, scale: number }` meaning `units / 10^scale`, so `12.50` is `{ units: 1250n, scale: 2 }`. The scale is kept: `12.50` and `12.5` are equal in value but print differently.

Create values only through these functions, never by hand, so every value is validated:

| Function                 | Example                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `decimal(text)`          | `decimal("12.50")`, plain decimal text as databases and JSON exchange it. `"007"` is 7. |
| `fromNumber(number)`     | `fromNumber(1.005)` is 1.005 (the shortest exact text, never the binary expansion)      |
| `fromBigInt(bigint)`     | `fromBigInt(12n)`                                                                       |
| `toDecimalString(value)` | `"12.50"`, `"-0.05"`, never `"-0"`. Use it to store and send values.                    |

## Calculating

| Function                                                  | Result                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `add`, `subtract`                                         | exact, keeps the larger scale: `12.50 + 1 = 13.50`                                    |
| `multiply`                                                | exact, scales add up: `8.40 * 0.19 = 1.5960`                                          |
| `negate`, `abs`, `sum`                                    | `sum([])` is 0                                                                        |
| `divide(a, b, { scale, mode })`                           | rounded exactly once: `divide(10, 3, { scale: 2, mode: "halfAwayFromZero" })` is 3.33 |
| `percentageOf(base, percent)`                             | exact, does not round: `percentageOf(8.40, 19)` is 1.5960                             |
| `compare`, `equals`, `isZero`, `isNegative`, `min`, `max` | by value, the scale does not matter                                                   |

## Rounding

```ts
round(value, { scale: 2, mode: "halfAwayFromZero" });
roundToStep(value, decimal("0.05"), "halfAwayFromZero"); // 1.234 -> 1.25 (Swiss cash)
```

| Mode                            | 2.5 | -2.5 | 3.5 | -2.1 |
| ------------------------------- | --- | ---- | --- | ---- |
| `halfAwayFromZero` (commercial) | 3   | -3   | 4   | -2   |
| `halfEven` (banker's)           | 2   | -2   | 4   | -2   |
| `towardZero`                    | 2   | -2   | 3   | -2   |
| `awayFromZero`                  | 3   | -3   | 4   | -3   |
| `floor`                         | 2   | -3   | 3   | -3   |
| `ceil`                          | 3   | -2   | 4   | -2   |

`round` always returns exactly `scale` digits: `round(12.5, { scale: 2, ... })` is `12.50`. An unknown mode throws at once, even when nothing needs rounding.

## Allocating

```ts
allocate(decimal("10.00"), [decimal("1"), decimal("1"), decimal("1")], { scale: 2 }); // 3.34, 3.33, 3.33
```

The parts always sum to the total. Leftover units go to the parts with the largest remainder, on a tie to the earlier part. A ratio of 0 never receives anything. A total with more digits than `scale` is refused: round it first.

## Reading user input

```ts
parse("12,50", "de-DE"); // { ok: true, value: 12.50 }
parse("12.50", "de-DE"); // { ok: false, error: "groupingNotAllowed" }
parse("1e5", "de-DE"); // { ok: false, error: "invalidCharacter" }
```

`parse` never throws for user input. It returns an error code, so your app can translate it:
`empty`, `incomplete`, `invalidCharacter`, `groupingNotAllowed`, `invalidGrouping`, `ambiguousGrouping`, `multipleDecimalSeparators`, `tooManyFractionDigits`, `negativeNotAllowed`.

Options: `maxFractionDigits` (e.g. 2 for cents), `allowNegative` (default true), `allowGrouping` (default false).

**Grouping separators are refused by default.** In a form, `1.234.567` may be 1234,567 typed with the numpad dot, and no parser can tell. Turn grouping on only for pasted or imported values:

```ts
parse("1.234,50", "de-DE", { allowGrouping: true }); // { ok: true, value: 1234.50 }
parse("1.234", "de-DE", { allowGrouping: true }); // { ok: false, error: "ambiguousGrouping" }
```

With grouping on, separators are accepted only where `Intl` itself would put them, and a single `.` or `,` without a decimal part is ambiguous. In locales that group with a space, any kind of space counts.

### In a form field

- Filter keystrokes with `isValidPartialInput(nextValue, locale, options)`. It allows unfinished input like `"-"` or `"12,"` and never a grouping separator.
- While the field has focus, show the value **without** grouping: `format(value, locale, { useGrouping: false })`. Show it grouped only after the user leaves the field. Then the user never edits a grouped number.
- Parse on blur with `parse(text, locale)`. An `"empty"` error is your empty value (for example `null`), not 0.

## Formatting

```ts
format(decimal("1234.50"), "en-US", { style: "currency", currency: "EUR" }); // "€1,234.50"
format(decimal("2.675"), "de-DE"); // "2,675"
```

`format` never rounds: it shows exactly the digits of the value. Round first for two-digit money. Options: `style` (`decimal`, `currency`, `unit`; not `percent`), `currency`, `currencyDisplay`, `unit`, `unitDisplay`, `useGrouping`, `signDisplay`. Anything else is refused.

`localeSymbols(locale)` returns the decimal, group and minus symbols of a locale. They come from the runtime's `Intl` data, so `format` and `parse` always agree within one runtime.

## Errors

Programmer errors throw a `DecyError` with a `code`, for example `invalidDecimal`, `invalidScale`, `invalidRoundingMode`, `divisionByZero`, `invalidRatios`, `invalidOptions`, `invalidIntlOptions`. User input never throws (see `parse`).

## Requirements

- Node 20 or newer, or a browser whose `Intl.NumberFormat` formats decimal strings exactly (all major engines since 2023).
- On an older engine, `format` throws `unsupportedEnvironment` instead of showing a number that lost digits.
- Every result has at most 30 digits after the decimal point (`MAX_SCALE`).

## License

MIT
