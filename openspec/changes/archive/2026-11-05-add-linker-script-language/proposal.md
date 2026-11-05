# Proposal

## Why

The extension registers its completion provider for the `plaintext` language id and contributes no language of its own. Three defects follow from that single fact: linker keywords are offered in every plain-text file; opening a lone `.lds` file outside a workspace never activates the extension because activation is `workspaceContains`; and if another installed extension maps `.lds` to its own language id, this extension stops working with no error.

## What Changes

- Contribute a `linker-script` language with `.lds` and `.ld` extensions, human-readable aliases, and a `language-configuration.json`.
- Add editor behavior for linker scripts: block-comment tokens, bracket pairs, folding markers, and a word pattern that keeps `SORT_BY_NAME` and `.text.foo` intact.
- **BREAKING**: stop registering providers for `plaintext`. Keyword completion no longer appears in ordinary text files.
- Register providers for both `linker-script` and `ld`, and declare `onLanguage:ld` explicitly, so the extension keeps working when another extension wins the `.lds` association.
- Activate whenever a linker script is opened, including a single file with no workspace folder.
- State `^1.74.0` as the minimum supported VS Code version, which is what makes activation events implicit for the contributed language.

## Capabilities

### New Capabilities

- `language-support`: the language identity, file associations, activation rules, editor configuration, and cross-extension compatibility behavior of linker script files.

### Modified Capabilities

- None.

## Impact

- `package.json` (`contributes.languages`, `activationEvents`, `engines`).
- `src/extension.ts` (registration targets), new `language-configuration.json`.
- Depends on `migrate-extension-toolchain` for the build layout and the raised engine floor.
