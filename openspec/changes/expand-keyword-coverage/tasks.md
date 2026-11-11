# Tasks

## 1. Output-section-body commands

- [x] 1.1 Add `section-body` to the scope lists of `PROVIDE`, `PROVIDE_HIDDEN` and `ASSERT`, rename the shared scope constant to `TOP_AND_SECTION_COMMANDS`, and extend the three summaries with the output-section placement; verify with `npm run compile && npm run test:unit` that the multi-scope summary check and the length caps pass.
- [x] 1.2 Update the assertions that pin the old behavior: the `keywords.test.ts` section-body test name and its `PROVIDE`/`ASSERT` negatives, and the `extension.test.ts` section-body assertion plus the `ASSERT` hover test name; verify with `npm run test:unit` and `npm run test:extension` that both suites pass and that the body now offers all three commands.
- [x] 1.3 Rewrite the README passage that describes an output section body as offering data commands only, and verify the wording against the `section-body` scope list in `src/keywords/registry.ts`.

## 2. Grammar for the new constructs

- [x] 2.1 Add `EXCLUDE_FILE` and `SORT_NONE` to the command alternation in `syntaxes/linker-script.tmLanguage.json`, with `SORT_NONE` before `SORT`, and add matching assertion lines to `test/grammar/sections.ld`; verify with `npm run test:grammar` that both lines are coloured and the fixture completeness check passes.
- [x] 2.2 Add `CONSTANT`, `SEGMENT_START`, `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_RELRO_END` to the expression alternation, and add assertion lines to `test/grammar/sections.ld` for a `CONSTANT` use and a `DATA_SEGMENT_ALIGN` assignment; verify with `npm run test:grammar`.
- [x] 2.3 Add a `PT_TLS` and a `PT_GNU_*` entry to `test/grammar/phdrs.ld` so the catch-all path the registry relies on is asserted, and verify with `npx vscode-tmgrammar-test "test/grammar/phdrs.ld"`.

## 3. Registry entries and alignment

- [x] 3.1 Add the twelve entries: four `PT_*` fields, `FILEHDR` and `FLAGS`, `EXCLUDE_FILE` and `SORT_NONE`, and the four builtin functions with the scope lists the design assigns; verify with `npm run test:unit` that every entry carries a summary and example within the caps and that multi-scope summaries name every placement.
- [x] 3.2 Declare the four `PT_*` ids in `GENERIC_COVERAGE` and delete the `FILEHDR` and `FLAGS` rows from `GRAMMAR_ONLY`; verify with `npm run test:unit` that the alignment suite reports no uncoloured registry keyword and no keyword declared in both places.
- [x] 3.3 Raise the entry count expectation and extend the added-ids list in `src/test/unit/keywords.test.ts`, and update the two README sentences that state the keyword count; verify with `npm run test:unit` that the count assertion passes and with a read of the README that both numbers read 84.

## 4. Integration

- [x] 4.1 Run `npm test` (compile, unit, grammar, extension host) and verify every suite passes with the new entries offered in the scopes the spec delta describes.
- [ ] 4.2 Start the extension with F5 and verify in a `.lds` file that `ASSERT` is offered inside `.text : { }`, that `DATA_SEGMENT_ALIGN` is absent there, that `FILEHDR` appears inside `PHDRS`, and that hovering `SEGMENT_START` shows a signature started by `SEGMENT_START(`.
- [x] 4.3 Address the review findings: assert the new scopes in the unit suite, add the PHDRS extension-host test, add the `PT_GNU_EH_FRAME` fixture line, narrow the builtin requirement to the four placements the registry offers, correct the delta sentence that contradicted the data-segment scenario, refresh the README feature sentence, add the CHANGELOG entry, and correct the design's list-size figure.
- [x] 4.4 Address the second review round: assert each builtin's scope list whole, replace the copied `EXCLUDE_FILE` example with project-local names, reword `SORT_NONE` away from the manual's phrasing, add a `SEGMENT_START` hover test, state the function placements in the README, and align the design's non-goals and stale figures with what shipped.

## Workflow follow-up

- Archive the change once the review requirements are satisfied.
- Mention the added keywords and the output-section-body behavior in the release notes of the next version.