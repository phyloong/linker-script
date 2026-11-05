# Tasks

## 1. Metadata

- [x] 1.1 Bump `version` to `0.2.0` and set `categories`, `keywords`, `capabilities.untrustedWorkspaces`, and `capabilities.virtualWorkspaces`; verify `vsce package` accepts the manifest without warnings.
- [x] 1.2 Confirm `icon`, `repository`, `license`, and `engines` match reality; verify each path exists in the packaged artifact.

## 2. Documentation

- [x] 2.1 Rewrite `README.md` with description, feature list, complete example script, coexistence statement, requirements, and limitations; verify every claim against the built extension by trying it.
- [x] 2.2 Write the `0.2.0` changelog entry with a leading breaking-change section covering the language id, the removal of plaintext completion, and the minimum editor version; verify it matches the actual package.json diff.
- [x] 2.3 Capture screenshots from the released build for completion, hover, and highlighting; verify they show the shipped behavior and current theme (captured from the installed 0.2.0 VSIX, saved under `docs/screenshots/` and embedded in `README.md`).

## 3. Packaging

- [x] 3.1 Review `.vscodeignore` so the artifact contains `dist/`, `syntaxes/`, `language-configuration.json`, README, CHANGELOG, LICENSE, and the icon; verify with `vsce ls` that `src/`, `out/`, `node_modules/`, and maps are absent.
- [x] 3.2 Install the packaged `.vsix` into a clean VS Code profile and exercise all four capabilities; verify no error appears in the extension host log.

## 4. Release automation

- [x] 4.1 Add a CI workflow that runs type check, bundle, unit tests, extension-host tests, and `vsce package` on every push; verify it passes on a branch (first run on `master` at `9803df5` succeeded in 76 s, job "Verify and package").
- [x] 4.2 Add the tag-triggered publish job using trusted publishing, with a documented token fallback; verify the dry-run path reports the artifact it would publish.
- [x] 4.3 Dry-run the release on a throwaway pre-release version, then restore `0.2.0`; verify the packaged manifest and README are the files the listing will render (publishing itself is out of scope here).
