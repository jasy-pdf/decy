// Build the GitHub Release for a tag and create-or-update it (idempotent, so a re-triggered tag never
// duplicates or loses anything). Notes = changelogen's grouped feat/fix/chore for the delta since the
// previous tag, plus a contributor list resolved via GitHub's per-commit attribution (correct person and
// profile link, works with a private commit email). Same flow as jasy, without the per-package scoping.
//
// Driven by release.yml. Env in: TAG (v1.0.0), NAME (decy), VERSION (1.0.0), DIST (latest|alpha|...),
// GITHUB_REPOSITORY, GH_TOKEN. Set DRY_RUN=1 to print the notes instead of touching the release.
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" }).trim();
const gh = (args) => sh("gh", args);

const { TAG: tag, NAME: name, VERSION: version, DIST: dist, GITHUB_REPOSITORY: repo } = process.env;
if (!tag || !name || !version || !repo) {
  throw new Error("missing env: TAG, NAME, VERSION, GITHUB_REPOSITORY required");
}

// versionsort.suffix sorts -alpha/-beta/-rc BELOW the stable release, so the previous tag is correct
// across the alpha -> stable boundary. The first release falls back to the root commit.
const tags = sh("git", [
  "-c",
  "versionsort.suffix=-alpha",
  "-c",
  "versionsort.suffix=-beta",
  "-c",
  "versionsort.suffix=-rc",
  "tag",
  "--sort=-v:refname",
  "--list",
  "v*",
])
  .split("\n")
  .filter(Boolean);
const index = tags.indexOf(tag);
const from =
  (index >= 0 && index + 1 < tags.length && tags[index + 1]) ||
  sh("git", ["rev-list", "--max-parents=0", "HEAD"]);

// 1) Grouped notes for the delta (changelogen print mode), minus its own header line and contributor block.
// changelogen still writes a CHANGELOG.md in print mode; we only want stdout, so remove that artifact.
const hadChangelog = existsSync("CHANGELOG.md");
let notes = "";
try {
  notes = sh("npx", ["changelogen@latest", "--from", from, "--to", tag, "--no-output"]);
} catch {
  /* empty delta */
}
if (!hadChangelog && existsSync("CHANGELOG.md")) rmSync("CHANGELOG.md");
// In CI (non-TTY) changelogen's logger leaks a "[log]" line onto stdout; start at the real changelog.
const begin = notes.search(/^(\[compare changes\]|#{1,6}\s)/m);
if (begin > 0) notes = notes.slice(begin);
notes = notes
  .replace(/### ❤️ Contributors[\s\S]*$/m, "")
  .replace(/^##\s.*$/m, "")
  .trim();

// 2) Contributors via per-commit attribution (correct GitHub user, not an email-search hit).
const seen = new Set();
const contributors = [];
for (const sha of sh("git", ["log", `${from}..${tag}`, "--pretty=format:%H"])
  .split("\n")
  .filter(Boolean)) {
  let data;
  try {
    data = JSON.parse(gh(["api", `repos/${repo}/commits/${sha}`]));
  } catch {
    continue;
  }
  const login = data.author?.login;
  if (!login || login.endsWith("[bot]") || seen.has(login)) continue;
  seen.add(login);
  contributors.push({ login, name: data.commit?.author?.name || login });
}
const contribBlock = contributors.length
  ? "### ❤️ Contributors\n\n" +
    contributors.map((c) => `- [${c.name}](https://github.com/${c.login}) (@${c.login})`).join("\n")
  : "";

const body = [notes, contribBlock].filter(Boolean).join("\n\n") || `${name} ${version}`;

if (process.env.DRY_RUN) {
  console.log(`--- title: ${name} ${version}  (range ${from} -> ${tag}) ---\n${body}`);
  process.exit(0);
}

// 3) Create-or-update the release.
writeFileSync("RELEASE_NOTES.md", body);
let exists = true;
try {
  gh(["release", "view", tag]);
} catch {
  exists = false;
}
if (exists) {
  gh(["release", "edit", tag, "--title", `${name} ${version}`, "--notes-file", "RELEASE_NOTES.md"]);
} else {
  gh([
    "release",
    "create",
    tag,
    "--title",
    `${name} ${version}`,
    "--notes-file",
    "RELEASE_NOTES.md",
    dist === "latest" ? "--latest" : "--prerelease",
  ]);
}
console.log(
  `${exists ? "updated" : "created"} release ${tag} (${name} ${version}); ${contributors.length} contributor(s)`,
);
