# AGENTS.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project

`linker-script` is a VS Code extension (publisher `amapleaf`, v0.1.0) that adds completion/snippets for GNU linker script (`.lds`) keywords. It is a single-purpose, very small codebase: two source files plus a small test tree.

## Commands

- `npm run compile` — `tsc --noEmit` (type check) followed by `node esbuild.js` (bundle). The bundle is `dist/extension.js`, which is what `main` points at.
- `npm run typecheck` — type check only (`tsc --noEmit`); produces no output files.
- `npm run bundle` — esbuild only; writes `dist/extension.js` plus the compiled test bundles under `dist/test/`.
- `npm run watch` — one type check, then `node esbuild.js --watch`; this is the `preLaunchTask` for the launch configurations in `.vscode/launch.json`. The task's custom problem matcher keys off esbuild's `[watch] build started/finished` lines.
- `npm run lint` — ESLint flat config (`eslint.config.mjs`) with type-aware `typescript-eslint` rules.
- `npm test` — `npm run compile`, then `npm run test:unit`, then `npm run test:extension`.
- `npm run test:unit` — plain Mocha (TDD UI) over `dist/test/unit/**/*.test.js`. No VS Code download, no extension host; run `npm run bundle` first if `dist/` is stale.
- `npm run test:extension` — `vscode-test` with `.vscode-test.mjs`, which targets `dist/**/*.test.js` (so the pure-Node suites also run a second time inside the host) and downloads VS Code 1.74.0 into `.vscode-test/` on first run.
- Run a single unit test: `npx mocha --ui tdd dist/test/unit/placeholder.test.js` (or change the glob).
- Run a single extension-host test: `npx vscode-test --grep "Extension Tests"` — Mocha's filters are passed through to the test run — or use `suite.only` / `test.only` in `src/test/extension.test.ts`.
- `npm run package` — produces `linker-script-0.1.0.vsix` via the local `@vscode/vsce` binary (`vscode:prepublish` runs `npm run compile` first). `.vscodeignore` ships `dist/extension.js` only: `out/`, `src/`, `node_modules/`, source maps, `dist/test/`, and the repo's agent/tooling directories are excluded.
- Debugging: F5 with the **Extension** launch config opens a second VS Code window with this extension loaded. Open a file named `*.lds` there to test completions.

## Architecture

- `src/extension.ts` — `activate()` registers exactly one provider: `vscode.languages.registerCompletionItemProvider('plaintext', new CompletionProvider)`. Note the language id is **`plaintext`**, not a linker-script language: `package.json` has no `contributes.languages` (it was removed) and no `contributes.languages`/`grammars` block exists, so `.lds` files get completions only because VS Code treats them as plain text. `activationEvents` is `workspaceContains:**/*.lds`, so the extension only activates when a `.lds` file is in the workspace.
- `src/Completion.ts` — `CompletionProvider.provideCompletionItems` constructs every keyword as a `vscode.CompletionItem` with an explicit `kind` (`Method`, `Keyword`, `Struct`, `Function`, `Field`) and a `SnippetString` carrying tab-stop placeholders, then returns the whole array unconditionally. There is no context filtering, prefix matching, or trigger-character logic — adding a keyword means appending a block and adding the variable to the returned array.
- `esbuild.js` — two build configs: the extension bundle (`src/extension.ts` → `dist/extension.js`, `platform: node`, `format: cjs`, `external: ['vscode']`) and the test bundle (`src/test/**` → `dist/test/**`, same settings). `vscode` is the only runtime require in the output.
- `src/test/` — `src/test/extension.test.ts` holds the extension-host suite (`src/test/unit/` holds pure-Node suites); both use the Mocha **TDD** UI (`suite`/`test`, not `describe`/`it`), configured through `.vscode-test.mjs` (extension host) and the `test:unit` script (plain Node). The old `src/test/index.ts` runner is gone — `@vscode/test-cli` supplies the runner.

Build constraints: `tsconfig.json` sets `strict` and `noUnusedLocals` with `rootDir: src` and `noEmit: true`, so any new source file must live under `src/` and every local must be used, or `npm run compile` fails at the type-check step before anything is written to `dist/`. The toolchain is TypeScript 5.9 (the 7.x line is blocked by `typescript-eslint`'s `<6.1.0` peer range), `@types/node` 16, and `engines.vscode ^1.74.0` with `@types/vscode ~1.74.0` pinned to the same floor — avoid TS or VS Code APIs those versions do not provide. The developer tooling (`@vscode/test-cli`/`@vscode/test-electron`, `@vscode/vsce`, `mocha`, `eslint`) needs Node >= 22.13 on the developer machine; that is a build-time requirement only and does not raise `engines.vscode`, since the extension host still runs the Node 16 bundled with VS Code 1.74.

## OpenSpec workflow

This repo is managed with OpenSpec (`schema: spec-driven` in `openspec/config.yaml`). All specs, proposal, design, and task artifacts **must be written in English**; keep OpenSpec headings and SHALL/MUST keywords in English. Active changes live in `openspec/changes/` (completed ones under `openspec/changes/archive/`), and long-lived specs in `openspec/specs/`. Slash commands are mirrored for each agent (e.g. `.codebuddy/commands/opsx/{explore,propose,apply,update,sync,archive}.md`, same set under `.claude/`, `.agents/`, `.opencode/`) — use the `opsx` commands rather than editing `openspec/` files by hand.
