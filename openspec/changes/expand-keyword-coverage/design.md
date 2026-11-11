# Design

## Context

See `proposal.md` for the motivation. Two constraints shape every decision here:

- `src/keywords/registry.ts` is the only copy of keyword data, and `src/test/unit/grammar-sync.test.ts` enforces set alignment in both directions. A registry entry without a colouring pattern fails the suite, and a spelling listed in a grammar alternation without a registry entry (or a declared exception) fails it too. `GRAMMAR_ONLY` and `GENERIC_COVERAGE` are the two escape hatches, and a spelling may not sit in both a table and the registry.
- `src/test/unit/keywords.test.ts` pinned the entry count at 72 before this change, forbids newline characters inside a snippet placeholder, requires each summary to be a single sentence under 160 characters, and requires every multi-scope summary to name every placement using the fixed phrases `top level`, `SECTIONS`, `output section`, `MEMORY`, `PHDRS`, `VERSION`, `overlay`.

## Goals / Non-Goals

**Goals**

- Every added keyword passes both the registry suite and the alignment suite without weakening either.
- Placement claims match `ld` itself, not what the extension finds convenient.

**Non-Goals**

- No new scope name: every entry fits `top`, `sections`, `section-body`, `memory`, `phdrs`, `version` or `overlay`.
- No `signature` override. Every snippet in this change derives an acceptable signature.
- No `MAXPAGESIZE` or `COMMONPAGESIZE` entry: they are operands, not statements, and `CONSTANT` documentation is enough to make them discoverable.
- No version bump. The CHANGELOG gains an `Unreleased` entry that also records the version-node colouring fix shipped by the companion change, so both land in the same release note.

## Decisions

### The output-section-body commands are fixed as one bucket

`ld`'s `ldgram.y` builds an output section body from `statement`, which includes `assignment` (covering `PROVIDE` and `PROVIDE_HIDDEN`) and `ASSERT_K`. The ld manual's own `ASSERT` example writes `PROVIDE (__stack = .)` and `ASSERT (...)` inside `.stack : { }`. All three share the `TOP_AND_SECTIONS` scope list today, so all three gain `section-body` together and the spec scenario that names them is rewritten once.

Alternative rejected: adding only `ASSERT` would leave `PROVIDE` withheld from the same body `ld` accepts it in, and would force the spec to explain a split that has no principle behind it.

The constant is renamed `TOP_AND_SECTION_COMMANDS` so its name still describes its contents after gaining a fourth scope.

### `EXCLUDE_FILE` inserts a bare call

Its snippet is `EXCLUDE_FILE(${1:file.o})`, the same shape as every other command entry, and the derived signature reads `EXCLUDE_FILE(file.o)`. The rule that it must sit inside the wildcard parentheses, and that a sorting command may contain it but not the reverse, is carried by the example:

```
*(EXCLUDE_FILE(foo.o) .text*)
*(SORT_BY_NAME(EXCLUDE_FILE(crtend.o) .ctors))
```

Alternative rejected: wrapping the wildcard in the snippet (`*(EXCLUDE_FILE(file.o) .text*)`) produces legal text on accept, but the item label would no longer match the inserted text, and hover would need the first `signature` override in the registry to stop showing a form with a leading `*`. One undocumented mechanism is not worth one keyword.

### Placement follows `ld`, at the cost of longer summaries

| Entry | Scope list | Evidence |
| --- | --- | --- |
| `DATA_SEGMENT_ALIGN`, `DATA_SEGMENT_RELRO_END` | `sections` | The manual says the first can only be used directly in `SECTIONS`, not in output section descriptions; the second must sit between `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_END`. |
| `CONSTANT`, `SEGMENT_START` | `top`, `sections`, `section-body`, `overlay` | Both are ordinary expression operators, offered in the four placements the expression scope list already uses; `MEMORY` stays out because completion there is deliberately narrow. |

The spec names those four placements rather than saying "wherever an expression is legal", so the requirement states exactly what completion offers. The two four-scope entries must name all four placements in one sentence. `SEGMENT_START` is the tight case; its wording must stay under 160 characters, which is achievable but leaves little slack.

Alternative rejected: scoping all four to `sections` keeps summaries short, but offers `SEGMENT_START` and `CONSTANT` at only one of their legal placements and would make hover prose false.

### Program header types stay on the catch-all path

`PT_TLS`, `PT_GNU_STACK`, `PT_GNU_RELRO` and `PT_GNU_EH_FRAME` match the existing `PT_[A-Z_]+` pattern, so each gets a `GENERIC_COVERAGE` row rather than a grammar alternation. The table documents the fragment and the scope, so tightening the class still fails the alignment suite.

`FILEHDR` and `FLAGS` are already coloured by explicit rules, so they move from `GRAMMAR_ONLY` into the registry and their rows are deleted. Leaving the rows would fail the "declared in GRAMMAR_ONLY but documented in the registry" check.

The `PHDRS` flag inside a program header entry shares its spelling with the block keyword and stays undocumented; hover on it answers with the block, which is a known, harmless overlap. Completion inside a `PHDRS` body does not offer it, because the block entry is scoped to `top`.

### Fixtures grow in place

New assertion lines go into `test/grammar/sections.ld` (`EXCLUDE_FILE`, `SORT_NONE`) and `test/grammar/phdrs.ld` (a `PT_TLS` entry and the three `PT_GNU_*` types), not into new fixture files: the completeness check runs per line and existing files already own these constructs.

`SORT_NONE` must precede `SORT` in the grammar alternation, because `SORT` is a prefix of it and the ordering check rejects the reverse.

## Risks / Trade-offs

- [The section-body completion list grows from 24 to 31 items] -> Accepted: the editor filters by typed prefix, and the registry is a legality table, not a shortlist. The README sentence that describes the body as data commands only is updated so the documentation does not contradict the list.
- [`SEGMENT_START` summary exceeds the 160-character cap while naming four placements] -> Mitigation: draft the sentence first and shorten the verb phrase; the cap is asserted by the unit suite, so the build fails rather than shipping a truncated tooltip.
- [Four new `GENERIC_COVERAGE` rows go stale if the `PT_` class is tightened] -> Mitigation: the alignment suite validates each row against a live pattern and scope, so a stale row fails.
- [The half-state is worse than either end state] -> Mitigation: the scope change, the spec scenario, the two unit assertions and the extension-host assertion land in the same task, so no commit leaves the suite passing with contradicting behavior.

## Migration Plan

None. The extension stores no state, the manifest and activation events do not change, and a user sees only additional completion items and longer tooltips. Rollback is reverting the commit.

## Open Questions

None.