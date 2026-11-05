# Tasks

## 1. Dependencies and metadata

- [ ] 1.1 Rewrite `package.json` devDependencies: drop `vscode` and `vsce`, add `@types/vscode@~1.74.0`, `esbuild`, `@vscode/vsce`, `@vscode/test-cli`, `@vscode/test-electron`, ESLint, and move `@types/node` to 16.x; verify `npm install` completes without running a VS Code download.
- [ ] 1.2 Set `engines.vscode` to `^1.74.0` and `main` to `./dist/extension.js`; verify `package.json` parses and `main` matches the build output path.
- [ ] 1.3 Remove `postinstall`, the `test` script's legacy runner invocation, and `tslint.json`; verify `npm run` lists only the scripts that exist in the file.

## 2. Build pipeline

- [ ] 2.1 Add `esbuild.js` bundling `src/extension.ts` to `dist/extension.js` with `external: ['vscode']`, `platform: node`, `format: cjs`; verify `node esbuild.js` produces the file and it requires only `vscode` at runtime.
- [ ] 2.2 Set `tsconfig.json` to `noEmit` type checking and confirm `tsc --noEmit` passes on the untouched sources.
- [ ] 2.3 Wire `compile` to run type checking and bundling in that order, and `watch` to the matching incremental form; verify a deliberate type error fails `npm run compile` before any bundle is written.
- [ ] 2.4 Update `.vscodeignore` to exclude `out/**` and `src/**` while keeping `dist/**`; verify with `vsce ls` that the file list contains `dist/extension.js` and no `out/` or `src/` entries.
- [ ] 2.5 Point `.vscode/launch.json` `outFiles` and the `.vscode/tasks.json` background task at `dist/` and the new watch script; verify F5 launches an extension host that loads without error.

## 3. Test infrastructure

- [ ] 3.1 Add `.vscode-test.mjs` targeting `dist/**/*.test.js`; verify `vscode-test` reports the existing placeholder suite as passing.
- [ ] 3.2 Add a plain-Mocha unit path for tests that need no extension host, wired to a separate npm script; verify a trivial pure test runs without downloading VS Code.
- [ ] 3.3 Replace `src/test/index.ts` usage and keep `src/test/extension.test.ts` compiling under the new layout; verify `npm test` runs both paths green.

## 4. Verification

- [ ] 4.1 Run `npm install && npm run compile && npm test` from a clean checkout state and confirm all three succeed in order.
- [ ] 4.2 Package with `vsce package` and inspect the archive: verify `dist/extension.js`, `package.json`, README, CHANGELOG, and icon are present, and `out/`, `src/`, `node_modules/`, and source maps are absent.
- [ ] 4.3 Update `AGENTS.md` build/test sections to describe the new commands and output directory; verify every documented command runs as written.
