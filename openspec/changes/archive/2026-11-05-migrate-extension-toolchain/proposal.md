# Proposal

## Why

The extension still builds on a 2019 toolchain: TypeScript 3.1, the long-abandoned `vscode` npm package, `vsce` 1.54, TSLint, and the removed `vscode/bin/test` runner. `npm test` depends on a `postinstall` hook that downloads a VS Code build for a test harness that no longer exists, and `npm install` itself cannot complete reliably today.

Every 0.2.0 feature that follows — a second provider, a data-driven keyword registry, grammar snapshot tests — would be added on top of a build nobody can reproduce. The toolchain is replaced first so the later changes have a working baseline.

## What Changes

- Replace `tsc`-only emit with esbuild bundling to `dist/extension.js`; `main` moves from `./out/extension` to `./dist/extension.js`, and the launch/task `outFiles` and `.vscodeignore` entries follow.
- **BREAKING**: raise `engines.vscode` from `^1.30.0` to `^1.74.0`. Extensions can no longer be installed on VS Code releases older than 1.74; this is the only user-visible consequence of the migration.
- Replace the `vscode` devDependency with `@types/vscode` pinned to the new engine floor, so type checking cannot describe APIs the declared minimum does not have.
- Upgrade TypeScript to the current 7.x line, falling back to the 5.x line if the type-aware lint tooling rejects it.
- Replace TSLint with an ESLint flat config, or drop separate linting where `strict` and `noUnusedLocals` already cover the same ground.
- Replace `vsce` 1.54 with `@vscode/vsce` 4.x and point the `package` script at the current binary layout.
- Replace the legacy extension test runner with `@vscode/test-cli` and add a separate plain-Node path for logic that needs no extension host.
- Remove `postinstall` and `.vscode-test` leftovers, and move `@types/node` from the 8.x line to the Node 16 release bundled with VS Code 1.74 so test code cannot assume APIs users do not have.

## Capabilities

None. This is a pure tooling migration: no completion, hover, grammar, or activation behavior changes. The raised minimum VS Code version is a distribution constraint recorded here and in the tasks; it is asserted as a requirement by the `language-support` capability introduced in a follow-up change, not duplicated in a spec of its own.

### New Capabilities

- None.

### Modified Capabilities

- None.

## Impact

- `package.json`, `tsconfig.json`, `.vscodeignore`, `.vscode/launch.json`, `.vscode/tasks.json`.
- `tslint.json` is removed; `src/test/index.ts` is replaced by the new test layout.
- Adds `esbuild`, `@vscode/vsce`, `@vscode/test-cli`, `@vscode/test-electron`, and ESLint as dev dependencies.
- Every later 0.2.0 change depends on this one; none of them can start before it lands.
