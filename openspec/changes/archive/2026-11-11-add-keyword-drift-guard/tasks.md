# Tasks

## 1. Suite skeleton and keyword extraction

- [x] 1.1 Create `src/test/unit/grammar-sync.test.ts` that loads
  `syntaxes/linker-script.tmLanguage.json` through `path.join(__dirname, '..', '..', '..')`
  (the `language.test.ts` pattern), uses the Mocha TDD UI (`suite`/`test`), and runs with
  `npm run bundle && npx mocha --ui tdd dist/test/unit/grammar-sync.test.js`
- [x] 1.2 Implement the walker that collects every `match` and `begin` string from the
  grammar JSON, and verify it reports 51 pattern strings for the current grammar
- [x] 1.3 Implement token search that strips character classes and escape sequences first, and
  verify that the id `A` is reported as uncoloured (the unstripped search hides it behind
  `[A-Za-z_]`)
- [x] 1.4 Implement keyword-list detection: a non-capturing group whose alternatives are all
  bare words, skipping any group that contains a `_`-terminated fragment. Verify it finds the
  command list (contains `SORT_BY_INIT_PRIORITY`), the expression list (contains `ALIGN`), the
  version list (contains `global`, `local`, `extern`), and does not report a `PT_` token
- [x] 1.5 Add the new suite to the unit-test inventory in `AGENTS.md`, and verify the entry
  names the file and what it compares

## 2. Registry to grammar assertion

- [x] 2.1 Add `GENERIC_COVERAGE` with 14 rows, each carrying the id, a fragment that must
  still appear in a grammar pattern, and the scope that pattern must produce; verify every row
  resolves against the current grammar
- [x] 2.2 Assert that each registry id is either found as a literal token or has a
  `GENERIC_COVERAGE` row; verify the suite passes, then temporarily add a fabricated id to
  `KEYWORDS` and confirm the failure names it and points at `GENERIC_COVERAGE`
- [x] 2.3 Assert that each `GENERIC_COVERAGE` row's fragment and scope are still present in the
  grammar; verify by temporarily changing the `PT_` pattern and confirming the row fails

## 3. Grammar to registry assertion

- [x] 3.1 Add `SPELLING_VARIANTS` mapping `org`, `o` to `ORIGIN` and `len`, `l` to
  `LENGTH`, and assert every value is a registry id; verify the suite passes and fails when a
  value is mistyped
- [x] 3.2 Add `GRAMMAR_ONLY` for `AT`, `FLAGS` and `FILEHDR` with a reason each; verify the
  suite passes
- [x] 3.3 Assert every extracted keyword token is in the registry, in `SPELLING_VARIANTS`, or
  in `GRAMMAR_ONLY`; verify by temporarily adding an unknown word to a grammar alternation and
  confirming the failure names it
- [x] 3.4 Record in the test's header comment that a new keyword family must be written as a
  bare-word alternation for the extractor to see it; verify the comment states the shape rule

## 4. Alternation ordering assertion

- [x] 4.1 Assert that within each detected keyword list no alternative is a prefix of a later
  alternative; verify the current grammar passes with `PROVIDE_HIDDEN` ahead of `PROVIDE`
- [x] 4.2 Verify the failure path by temporarily reordering `PROVIDE` before `PROVIDE_HIDDEN`
  and confirming the message names both spellings, then restore the order

## 5. Integration

- [x] 5.1 Run `npm run compile`, `npm run test:unit` and `npm run test:grammar` and confirm
  all pass, with the new suite appearing in the unit run
- [x] 5.2 Run `openspec validate add-keyword-drift-guard --strict` and confirm it
  reports no warnings
