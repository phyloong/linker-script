# Tasks

## 1. Specification

- [x] 1.1 Author `proposal.md`, `design.md`, and the `keyword-completion` and `syntax-highlighting` delta specs; verify `openspec validate complete-version-completion --strict` passes.

## 2. Keyword registry

- [x] 2.1 Add `global`, `local`, and `extern` entries with the `version` scope, original one-sentence summaries, examples, and valid snippets; verify the length and line caps still hold.
- [x] 2.2 Update `src/test/unit/keywords.test.ts` counts and add assertions that the `version` scope offers exactly the three commands and no top-level commands; verify the unit suite passes.
- [x] 2.3 Add a lookup unit test that lower-case version ids resolve exactly and do not shadow `EXTERN`.

## 3. Grammar and fixtures

- [x] 3.1 Add `extern` to the version keyword family and add a `#version-extern` region with its own brace, reusing existing `.ld` scopes and keeping regexes anchored; verify leaf scopes still end in `.ld`.
- [x] 3.2 Extend `test/grammar/version.ld` with inline assertions for the extern language block, node inheritance, and wildcard symbols; verify `npm run test:grammar` passes and the fixture guard is satisfied.

## 4. Extension-host verification

- [x] 4.1 Add an extension-host completion test for a `VERSION` block, hover tests for the three new commands, and a negative test for a user-defined version node name; verify the new tests type-check with `npx tsc --noEmit`. The `npm run test:extension` host run is a workflow follow-up because the VS Code test host is blocked in this sandbox.

## 5. Documentation

- [x] 5.1 Update `README.md` (remove the empty-VERSION limitation, refresh the keyword count, note version-script coverage) and add an Unreleased entry to `CHANGELOG.md`.
- [x] 5.2 Update `AGENTS.md` architecture notes for the new `version` entries and add the verified publishing-status note based only on facts the repository records.
- [x] 5.3 Correct the `documentation` field wording in the two archived design notes (`2026-11-05-add-keyword-hover/design.md` and `2026-11-05-improve-keyword-completion/design.md`), leaving the rest of each archived change intact.

## 6. Verification

- [x] 6.1 Run `npm run compile`, `npm run test:unit`, `npm run test:grammar`, `npm run lint`, and `openspec validate complete-version-completion --strict`; verify all pass.

## Workflow follow-up

- Sync the two delta specs into `openspec/specs/` with the opsx workflow, then archive `complete-version-completion`.
- Re-run `npm run test:extension` outside the sandbox to confirm the new host tests, since the VS Code test host is blocked here.
