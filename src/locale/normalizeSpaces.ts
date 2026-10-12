// Plain, no-break, figure, thin and narrow no-break space. Copying from a browser, a PDF or a typesetting
// program often turns one into another.
// Built from code points so the source shows them; a literal would be invisible.
const SPACE_CLASS = `[${String.fromCodePoint(0x20, 0xa0, 0x2007, 0x2009, 0x202f)}]`;
const IS_SPACE = new RegExp(`^${SPACE_CLASS}$`);
// Separate global regex for replacing: a global regex used with test() keeps state between calls.
const ALL_SPACES = new RegExp(SPACE_CLASS, "g");

/** In locales that group with a space, every kind of space counts as that group separator. */
export function normalizeSpaces(text: string, group: string): string {
  return IS_SPACE.test(group) ? text.replace(ALL_SPACES, group) : text;
}
