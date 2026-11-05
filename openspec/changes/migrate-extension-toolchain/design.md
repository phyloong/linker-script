# Design

## Context

See proposal.md - Why. Current constraints that shape the approach:

- The extension source is two files that import only the `vscode` module. There is no Node API usage, no runtime configuration, and no state.
- `main` points at `./out/extension`, produced by `tsc -p ./` with `rootDir: src`, `outDir: out`, `module: commonjs`, `target: es6`.
- The repository contains no `node_modules`. Any build or test command fails until dependencies are installed, and `postinstall` currently downloads a VS Code build for a removed runner.
- `tsconfig` enables `strict` and `noUnusedLocals`; those stay.
- The extension will keep using CommonJS in the extension host. ES modules are not an option for a Node extension host entry point.

## Goals / Non-Goals

**Goals:**

- A reproducible `npm install` with no network side effects beyond package installation.
- One build command that produces a packaged entry point, and one type-check command that produces no output.
- A test command that runs without a downloaded VS Code unless a test genuinely needs the extension host.
- Dependency versions from the current major lines, except where a pinned version is required by the declared engine floor.

**Non-Goals:**

- Changing any completion, hover, or grammar behavior. That is the later changes' work.
- Adding a bundler-agnostic abstraction, a monorepo, or a release pipeline. The pipeline belongs to the release change.
- Supporting web extension hosts or a `browser` entry point.

## Decisions

### esbuild for emit, tsc for types

Emit goes through a single `esbuild` call to `dist/extension.js` (`platform: node`, `format: cjs`, `external: ['vscode']`). Type checking becomes a separate `tsc --noEmit` run.

Reasoning: this is the layout the current VS Code extension template uses, it produces a single readable file, and it keeps type checking honest instead of relying on the emitter. Alternative kept on the table: stay with `tsc` alone. It is simpler and needs no new dependency, but it ships per-file modules and the repository is being reshaped for 0.2.0 anyway.

Consequence: `dist/` replaces `out/` everywhere. `.vscodeignore` must now exclude `out/**` explicitly, because the old directory is no longer produced on purpose and a stale one must never be packaged.

### Engine floor ^1.74.0, and types pinned to it

`@types/vscode` is pinned to `~1.74.0`, not to the latest release. If types run ahead of the engine floor, type checking accepts calls that throw on a user's machine. The floor itself is set by the version that generates activation events implicitly from `contributes`, which removes a whole class of "forgot to declare `onLanguage`" defects.

### TypeScript 7 with a documented fallback

The current 7.x line is adopted, but the type-aware lint parser's supported range is unverified. If `@typescript-eslint` rejects 7.x, the change falls back to the 5.x line rather than dropping type-aware linting. The fallback is a version swap in `package.json`, not a design change.

### ESLint flat config, with an explicit option to skip it

ESLint 10 replaces TSLint, configured flat. If the type-aware parser does not support TS 7, the choice is between downgrading TypeScript and shrinking lint to syntax-only rules. Lint is not load-bearing here: `strict` and `noUnusedLocals` catch most of what TSLint was configured for (`semicolon`, `curly`, `triple-equals`, `no-duplicate-variable`). Prefer a small working config over a large broken one.

### Two test paths

- `@vscode/test-cli` with `@vscode/test-electron` runs tests that need a real extension host, configured through `.vscode-test.mjs`.
- Everything else runs under Mocha in plain Node, with no VS Code download.

This split matters for the later changes: the scope scanner and the keyword registry are pure functions and must be testable without an editor. Mocha is kept rather than switching to `node:test` so a single assertion style covers both paths and no newer Node API is required by test code.

### `@types/node` pinned to 16

VS Code 1.74 bundles Node 16. Test code uses `assert`, so the types are still needed; pinning them to 16 keeps an accidental `fs`/`process` call from type-checking against an API the extension host may not have.

## Risks / Trade-offs

- [TypeScript 7 breaks the lint or test tooling] -> Fall back to the 5.x line; the artifact set does not change.
- [esbuild hides a module-resolution error that `tsc` would have caught] -> Keep `tsc --noEmit` in the same command chain, and treat a green build as requiring both steps.
- [Stale `out/` is packaged after the switch to `dist/`] -> Exclude `out/**` in `.vscodeignore` and verify with `vsce ls` before the first package.
- [Raised engine floor strands users on 1.30-1.73] -> Accepted and recorded as breaking; the floor is a product decision, not a tooling accident.
- [`@vscode/test-cli` requires a newer Node than the extension host] -> That requirement applies to the developer machine only; document it rather than raising `engines.vscode`.

## Migration Plan

1. Rewrite `package.json` scripts and dev dependencies; remove `postinstall`.
2. Add `esbuild.js`, adjust `tsconfig.json` for `noEmit` type checking, create `dist/` output.
3. Update `.vscodeignore`, `.vscode/launch.json`, and `.vscode/tasks.json` for the new output path.
4. Replace `src/test/index.ts` with the `.vscode-test.mjs` configuration; keep the existing test file compiling under Mocha.
5. Verify `npm install`, `npm run compile`, `npm test`, and `vsce ls` in that order.

Rollback: the migration is a working-tree change with no persisted state. Reverting the commit restores the previous build; the raised engine floor is reverted with it.
