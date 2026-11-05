# Tasks

## 1. Metadata

- [ ] 1.1 Bump `version` to `0.2.0` and set `categories`, `keywords`, `capabilities.untrustedWorkspaces`, and `capabilities.virtualWorkspaces`; verify `vsce package` accepts the manifest without warnings.
- [ ] 1.2 Confirm `icon`, `repository`, `license`, and `engines` match reality; verify each path exists in the packaged artifact.

## 2. Documentation

- [ ] 2.1 Rewrite `README.md` with description, feature list, complete example script, coexistence statement, requirements, and limitations; verify every claim against the built extension by trying it.
- [ ] 2.2 Write the `0.2.0` changelog entry with a leading breaking-change section covering the language id, the removal of plaintext completion, and the minimum editor version; verify it matches the actual package.json diff.
- [ ] 2.3 Capture screenshots from the released build for completion, hover, and highlighting; verify they show the shipped behavior and current theme.

## 3. Packaging

- [ ] 3.1 Review `.vscodeignore` so the artifact contains `dist/`, `syntaxes/`, `language-configuration.json`, README, CHANGELOG, LICENSE, and the icon; verify with `vsce ls` that `src/`, `out/`, `node_modules/`, and maps are absent.
- [ ] 3.2 Install the packaged `.vsix` into a clean VS Code profile and exercise all four capabilities; verify no error appears in the extension host log.

## 4. Release automation

- [ ] 4.1 Add a CI workflow that runs type check, bundle, unit tests, extension-host tests, and `vsce package` on every push; verify it passes on a branch.
- [ ] 4.2 Add the tag-triggered publish job using trusted publishing, with a documented token fallback; verify the dry-run path reports the artifact it would publish.
- [ ] 4.3 Dry-run the release on a throwaway pre-release version, then restore `0.2.0`; verify the published listing renders correctly before the real tag.
