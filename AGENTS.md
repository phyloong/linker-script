# AGENTS.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project

`linker-script` is a VS Code extension (publisher `amapleaf`, v0.1.0) that adds completion/snippets for GNU linker script (`.lds`) keywords. It is a single-purpose, very small codebase: two source files plus the standard generated extension test scaffold.

## Commands

- `npm run compile` — build with `tsc -p ./`, emitting CommonJS ES6 JS to `out/` (this is what `main` points at: `./out/extension`).
- `npm run watch` — incremental rebuild; this is the `preLaunchTask` for both launch configurations in `.vscode/launch.json`.
- `npm test` — `npm run compile` then the legacy `node ./node_modules/vscode/bin/test` runner. The runner expects a downloaded VS Code build; `postinstall` (`node ./node_modules/vscode/bin/install`) fetches it. Prefer running tests through the **Extension Tests** launch config in VS Code.
- Run a single test: the legacy `vscode/bin/test` harness has no CLI grep filter — use the **Extension Tests** launch config and restrict with `suite.only` / `test.only` in `src/test/extension.test.ts`, or point `--extensionTestsPath` at a narrower `out/test` directory.
- `npm run package` — produces a `.vsix` via the local `vsce` binary. `.vscodeignore` ships only `out/`, so `src/`, maps and tsconfig are excluded from the package.
- Debugging: F5 with the **Extension** launch config opens a second VS Code window with this extension loaded. Open a file named `*.lds` there to test completions.

`tslint` is a devDependency and `tslint.json` exists, but no npm script runs it; only the recommended `eg2.tslint` extension lints in-editor.

## Architecture

- `src/extension.ts` — `activate()` registers exactly one provider: `vscode.languages.registerCompletionItemProvider('plaintext', new CompletionProvider)`. Note the language id is **`plaintext`**, not a linker-script language: `package.json` has no `contributes.languages` (it was removed) and no `contributes.languages`/`grammars` block exists, so `.lds` files get completions only because VS Code treats them as plain text. `activationEvents` is `workspaceContains:**/*.lds`, so the extension only activates when a `.lds` file is in the workspace.
- `src/Completion.ts` — `CompletionProvider.provideCompletionItems` constructs every keyword as a `vscode.CompletionItem` with an explicit `kind` (`Method`, `Keyword`, `Struct`, `Function`, `Field`) and a `SnippetString` carrying tab-stop placeholders, then returns the whole array unconditionally. There is no context filtering, prefix matching, or trigger-character logic — adding a keyword means appending a block and adding the variable to the returned array.
- `src/test/` — standard Yo Code scaffold. `src/test/index.ts` configures Mocha with the **TDD** UI (`suite`/`test`, not `describe`/`it`); `src/test/extension.test.ts` currently contains only a placeholder assertion.

Build constraints: `tsconfig.json` sets `strict` and `noUnusedLocals` with `rootDir: src`, so any new source file must live under `src/` and every local must be used, or `npm run compile` fails. The toolchain is pinned to old versions (TypeScript 3.1, `@types/node` 8, `engines.vscode ^1.30.0`); avoid modern TS/VS Code APIs that those typings do not provide.

## OpenSpec workflow

This repo is managed with OpenSpec (`schema: spec-driven` in `openspec/config.yaml`). All specs, proposal, design, and task artifacts **must be written in English**; keep OpenSpec headings and SHALL/MUST keywords in English. Active changes live in `openspec/changes/` (completed ones under `openspec/changes/archive/`), and long-lived specs in `openspec/specs/`. Slash commands are mirrored for each agent (e.g. `.codebuddy/commands/opsx/{explore,propose,apply,update,sync,archive}.md`, same set under `.claude/`, `.agents/`, `.opencode/`) — use the `opsx` commands rather than editing `openspec/` files by hand.