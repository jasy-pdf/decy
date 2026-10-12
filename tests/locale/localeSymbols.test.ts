import { expect, test } from "vite-plus/test";
import { localeSymbols } from "../../src/locale/localeSymbols.ts";
import { errorCode } from "../helpers/errorCode.ts";

test("German and English swap the separators", () => {
  expect(localeSymbols("de-DE")).toEqual({ decimal: ",", group: ".", minus: "-" });
  expect(localeSymbols("en-US")).toEqual({ decimal: ".", group: ",", minus: "-" });
});

test("a malformed locale fails with our error", () => {
  expect(errorCode(() => localeSymbols("not a locale!"))).toBe("invalidIntlOptions");
});
