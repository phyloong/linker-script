# Tasks

## 1. Language contribution

- [ ] 1.1 Add `contributes.languages` for `linker-script` with `extensions: [".lds", ".ld"]`, aliases, and a `configuration` path; verify `vsce ls` includes the configuration file and that the status bar shows "Linker Script" for `.lds`.
- [ ] 1.2 Create `language-configuration.json` with block comments, bracket pairs, folding markers, and a word pattern covering `_` and interior dots; verify double-clicking `SORT_BY_NAME` and `.text.foo` selects each as one word.
- [ ] 1.3 Set `engines.vscode` to `^1.74.0` and remove `workspaceContains:**/*.lds` from `activationEvents`; verify a single `.lds` file opened without a folder activates the extension.

## 2. Provider registration

- [ ] 2.1 Replace the single `plaintext` registration in `src/extension.ts` with registration for every id in `SUPPORTED_LANGUAGE_IDS` (`linker-script`, `ld`); verify both ids receive completion in a manual test.
- [ ] 2.2 Declare `onLanguage:ld` explicitly; verify with the extension development host that opening a `.ld` file while the document language is forced to `ld` still yields completions.
- [ ] 2.3 Add a unit test asserting the supported id list and that activation registers one disposable per id; verify `npm test` passes.

## 3. Behavior verification

- [ ] 3.1 Verify a `.txt` file receives no completion items from this extension.
- [ ] 3.2 Verify `.lds` and `.ld` both receive completion with no workspace folder open.
- [ ] 3.3 Update `AGENTS.md` language/architecture notes to describe the real language id and the compatibility registration; verify the described behavior matches a manual run.
