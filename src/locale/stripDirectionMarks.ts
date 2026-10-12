// Left-to-right mark, right-to-left mark, Arabic letter mark: Intl puts them before the minus in RTL locales.
// Built from code points so the source shows them; a literal would be invisible.
const DIRECTION_MARKS = new RegExp(`[${String.fromCodePoint(0x200e, 0x200f, 0x061c)}]`, "g");

/** Removes invisible text direction marks, so formatted RTL numbers read back. */
export function stripDirectionMarks(text: string): string {
  return text.replace(DIRECTION_MARKS, "");
}
