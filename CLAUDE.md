# decy

**DECimal easY**: exact decimal math for money and quantities in TypeScript. Zero dependencies, runs in every modern browser and in Node.

decy does five things, and every calculation that touches money or quantities goes through it, without exception:

1. **Represent numbers exactly.** Never binary floats. Internally scaled `bigint`; at boundaries (database, JSON, APIs) a plain decimal string like `"1234.50"`.
2. **Parse and format per locale** (German and English first). Strict grammar: digits, exactly one decimal separator of the locale, a minus only where allowed. Grouping separators are never typed by the user, decy formats them. Ambiguous input is an error, never a guess (`"12.50"` in `de-DE` is invalid, not 1250).
3. **Calculate**: add, subtract, multiply, divide with defined precision, percentages, sums.
4. **Round deliberately**, always with a named mode (e.g. commercial half away from zero, to cents, to 0.05).
5. **Allocate without losing cents**: splitting 10.00 into 3 parts gives 3.34 + 3.33 + 3.33.

## Principles

- Correctness beats convenience. When in doubt, fail loudly with a clear error instead of returning a plausible wrong number.
- No floats in any code path that produces a result. `number` is only accepted as input where it is unambiguous (integers, or explicitly converted).
- Rounding never happens implicitly. Every rounding step names its mode and precision.
- Zero runtime dependencies. Locale data comes from the platform (`Intl`).
- The public API is small, explicit and fully typed. No type gymnastics.

## Workflow

- Do not commit, push, tag or publish. The maintainer does that. Leave changes in the working tree and suggest a one-line commit message.
- Small steps, talk before code. Discuss API changes before implementing them.
- Tests come first for this library: it is pure logic, the tests are the specification. Cover edge cases explicitly (negative values, zero, huge values, every rounding boundary, every locale).
- Run `vp check` and `vp test` before reporting a step as done.

## Code rules

- English only: code, names, comments, docs, commit messages.
- Comments: short, explain the why, only when it is not obvious. Never the how.
- No em-dashes or en-dashes anywhere. Use a normal hyphen.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
