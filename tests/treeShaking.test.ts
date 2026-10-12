import { fileURLToPath } from "node:url";
import { Rolldown } from "vite-plus/pack";
import { describe, expect, test } from "vite-plus/test";

const library = fileURLToPath(new URL("../src/index.ts", import.meta.url));

/** Bundles a consumer that imports the given names, like an app build would, and returns the output code. */
async function bundleImporting(names: string): Promise<string> {
  const entry = `import { ${names} } from ${JSON.stringify(library)};\nexport { ${names} };\n`;
  const build = await Rolldown.rolldown({
    input: "entry",
    logLevel: "silent",
    plugins: [
      {
        name: "consumer-entry",
        resolveId: (id) => (id === "entry" ? id : null),
        load: (id) => (id === "entry" ? entry : null),
      },
    ],
  });
  const { output } = await build.generate({ format: "esm" });
  return output.map((chunk) => ("code" in chunk ? chunk.code : "")).join("\n");
}

// Markers of the heavier parts. Each must be absent where unused and present where used.
const PARSER = "groupingNotAllowed";
const FORMATTER = "formatToParts";
const ALLOCATION = "invalidRatios";
const ROUNDING = "halfAwayFromZero";

describe("tree-shaking", () => {
  test("importing everything keeps every part (proves the markers are real)", async () => {
    const code = await bundleImporting("add, parse, format, allocate, round");
    for (const marker of [PARSER, FORMATTER, ALLOCATION, ROUNDING]) {
      expect(code).toContain(marker);
    }
  });

  test("add alone pulls in none of the heavier parts", async () => {
    const code = await bundleImporting("add");
    expect(code).toContain("function add");
    for (const marker of [PARSER, FORMATTER, ALLOCATION, ROUNDING]) {
      expect(code).not.toContain(marker);
    }
  });

  test("format pulls in the formatter, not the parser or allocation", async () => {
    const code = await bundleImporting("format");
    expect(code).toContain(FORMATTER);
    expect(code).not.toContain(PARSER);
    expect(code).not.toContain(ALLOCATION);
  });
});
