# Proposal

## Why

The registry in `src/keywords/registry.ts` lags behind what GNU ld accepts. Four program-header types, two `PHDRS` modifiers, two input-section filters, and four expression functions are missing, so completion and hover stay silent for constructs that appear in ordinary scripts. Worse, `PROVIDE`, `PROVIDE_HIDDEN` and `ASSERT` are withheld inside an output section body even though `ld`'s grammar accepts all three there, and the ld manual's own `ASSERT` example places `PROVIDE` and `ASSERT` inside `.stack : { ... }`. The size check a user is most likely to write finds no completion at the one place it belongs.

## What Changes

- Add four program-header types as `field` entries in the `phdrs` scope: `PT_TLS`, `PT_GNU_STACK`, `PT_GNU_RELRO`, `PT_GNU_EH_FRAME`. The grammar already colours them through its `PT_[A-Z_]+` catch-all, so each needs a `GENERIC_COVERAGE` row rather than a grammar edit.
- Document `FILEHDR` and `FLAGS`, which the grammar already colours, and delete their `GRAMMAR_ONLY` rows: the alignment suite rejects a spelling declared in both places.
- Add `EXCLUDE_FILE` and `SORT_NONE` as output-section-body entries, extend the grammar command alternation (`SORT_NONE` before `SORT` to keep the prefix rule), and add fixture lines for both.
- Add `section-body` to the scope lists of `PROVIDE`, `PROVIDE_HIDDEN` and `ASSERT`, rewrite their summaries to name the new placement, and **change the keyword-completion scenario that currently forbids `PROVIDE` and `ASSERT` there**.
- Add `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_RELRO_END` scoped to `SECTIONS` only, and `CONSTANT` and `SEGMENT_START` in every expression scope, with matching grammar additions.
- Raise the registry from 72 to 84 entries and update every place that states the number: the unit expectation, the README feature list and limitation list, and the section-body completion assertions in both test suites.

Not in scope: the version-node inheritance colouring bug, which ships as a separate change and shares the same `Unreleased` CHANGELOG section; `MAXPAGESIZE`/`COMMONPAGESIZE` as their own entries; and any new scope name.

## Capabilities

### New Capabilities

None. Every added keyword fits a family the `keyword-completion` requirement already names or is about to name.

### Modified Capabilities

- `keyword-completion`: the output-section-body scenario must offer `ASSERT`, `PROVIDE` and `PROVIDE_HIDDEN`, and three new requirements cover program-header modifiers, input-section filters, and builtin-function placement.
- `keyword-documentation`: the multi-scope hover scenario names two placements for `PROVIDE`; it must describe all four.

## Impact

- `src/keywords/registry.ts`: 12 new entries, 3 scope-list changes, 3 summary rewrites, 2 new scope-list constants.
- `syntaxes/linker-script.tmLanguage.json`: command alternation (`EXCLUDE_FILE`, `SORT_NONE`) and expression alternation (`CONSTANT`, `SEGMENT_START`, `DATA_SEGMENT_ALIGN`, `DATA_SEGMENT_RELRO_END`).
- `src/test/unit/grammar-sync.test.ts`: 4 `GENERIC_COVERAGE` rows added, 2 `GRAMMAR_ONLY` rows removed.
- `test/grammar/sections.ld`, `test/grammar/phdrs.ld`: new assertion lines.
- `src/test/unit/keywords.test.ts`: entry count, the section-body test name and both of its negative assertions.
- `src/test/extension.test.ts`: the section-body completion assertion and the `ASSERT` hover test name.
- `README.md`: the keyword count in two places and the description of what an output section body offers.
- No manifest change, no new dependency, no runtime behavior outside completion and hover.