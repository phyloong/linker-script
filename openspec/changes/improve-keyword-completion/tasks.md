# Tasks

## 1. Registry

- [ ] 1.1 Create the keyword registry module with the `{ id, kind, snippet, documentation, scopes }` shape and migrate every existing keyword into it; verify the item count matches the previous 51 plus additions.
- [ ] 1.2 Add missing coverage (`PROVIDE_HIDDEN`, `INSERT`, `REGION_ALIAS`, `LD_FEATURE`, `SORT_BY_NAME`, `SORT_BY_ALIGNMENT`, `SORT_BY_INIT_PRIORITY`, `SQUAD`, `KEEP`); verify each resolves to exactly one registry entry.
- [ ] 1.3 Fix the known snippet defects (`VERSION` placeholder newline, `experssion` spelling, single-form `SORT`/`GROUP`, bare `/DISCARD/`, missing second argument on `ASSERT`/`PROVIDE`); verify with unit tests asserting the exact inserted strings.
- [ ] 1.4 Add a unit test that every registry entry has a non-empty snippet, a kind, and at least one scope; verify the test fails when an entry is deliberately broken.

## 2. Scope scanner

- [ ] 2.1 Implement the single-pass scanner over text before the cursor, tracking normal/comment/string state and a brace stack labelled by block keyword; verify unit tests cover nesting of `SECTIONS` and `MEMORY`.
- [ ] 2.2 Add the `section-body` level inside `SECTIONS`; verify a cursor inside `.text : { }` reports `sections > section-body` and a cursor directly inside `SECTIONS` reports only `sections`.
- [ ] 2.3 Implement the three uncertainty conditions (stray closing brace, unterminated comment, `INCLUDE` present) and the comment/string cursor case; verify each has a unit test asserting `uncertain` or "no items".
- [ ] 2.4 Verify scanner performance is linear by testing a several-thousand-line synthetic script completes without noticeable delay.

## 3. Provider wiring

- [ ] 3.1 Rewrite `src/Completion.ts` to render `CompletionItem`s from registry entries filtered by the scanner result, preserving kinds and `SnippetString` insertion; verify an integration test asserts that `SECTIONS` is absent inside a section body.
- [ ] 3.2 Confirm the filtered provider is registered for both `linker-script` and `ld`; verify by forcing a document to `ld` and requesting completion.
- [ ] 3.3 Verify degradation end to end: a script with an extra `}` returns the full list, and a cursor inside `/* */` returns none.

## 4. Content review

- [ ] 4.1 Review every registry snippet against GNU ld syntax and correct argument order and names; verify by inserting each snippet into a sample script and running it through a linker if available, otherwise by manual inspection.
- [ ] 4.2 Update `AGENTS.md` architecture notes to point at the registry and scanner instead of the old inline construction; verify the description matches the code.
