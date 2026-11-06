# Design

## Context

See proposal.md - Why. Current implementation constraints:

- `src/Completion.ts` builds 51 items as local constants and returns one array; `tsconfig` with `noUnusedLocals` forces every local into that array.
- The provider receives `document` and `position`, so it can inspect text before the cursor but not a syntax tree.
- Both language ids from `add-linker-script-language` share one provider instance.

## Goals / Non-Goals

**Goals:**

- One data table drives completion now and hover later.
- Context filtering that is cheap, deterministic, and degrades safely.
- Registry entries that stay readable as a diff when a keyword is added.

**Non-Goals:**

- Full parsing, error recovery, or diagnostics.
- Prefix-aware ranking beyond what the editor already does.
- Completion for user-defined symbols or section names.

## Decisions

### Registry entry shape

```
{ id, kind, snippet, scopes }
```

`scopes` is a set drawn from `top | sections | section-body | memory | phdrs | version | overlay`. A keyword that is legal in several places lists all of them rather than being duplicated. This change only establishes the structural fields; the `summary` and `example` strings are added by the later `add-keyword-hover` change, which then reads the same table instead of keeping a second one.

Alternative rejected: deriving scope from the GNU ld grammar at build time. The grammar is prose; a hand-maintained flag is smaller and reviewable.

### Hand-written scanner, not a parser

A single pass over the text before the cursor tracks three states: normal, block comment, string. On `{` it pushes a frame labelled by the most recent block keyword; on `}` it pops. Inside `SECTIONS`, a second-level `{` pushes `section-body`, which is what separates section-level items from body-level items.

Alternative rejected: a real tokenizer/parser. It buys recovery and diagnostics, both of which are out of scope, at several times the code.

### Degradation is a flag, not a guess

The scanner returns either a confident scope path or `uncertain`. `uncertain` becomes true on a stray `}`, on an unterminated comment, or when `INCLUDE` appears anywhere before the cursor. `uncertain` maps to "return everything", never to "return the nearest guess", because a wrong filter is worse than no filter.

### Cursor in comment or string returns nothing

Returning the full list inside a comment trains users to accept items into text that cannot compile. An empty list is the honest answer.

### Snippet corrections are data edits, not logic changes

The known defects (`VERSION` newline inside a placeholder, `experssion`, single-form `SORT`/`GROUP`, bare `/DISCARD/`) are fixed in the registry. Mentioning them here prevents them from being carried into the new table unchanged.

## Risks / Trade-offs

- [Scope misclassification in unusual layouts, e.g. `AT>` or multiple statements on one line] -> Degradation rules catch structural confusion; remaining misclassification is a wrong filter, which the "return everything" rule cannot help with, so the scope table stays conservative: a keyword legal anywhere near a boundary lists both scopes.
- [Registry becomes a large single file] -> Accepted; one table is easier to audit than 51 blocks, and the file is data, not logic.
- [Scanner cost on large files] -> Scanning stops at the cursor offset, and linker scripts are small; no caching is added.
- [Hover depends on this change's registry] -> Recorded in the hover proposal as a hard prerequisite.
