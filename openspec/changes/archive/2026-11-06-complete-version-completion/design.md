# Design

## Context

See proposal.md - Why. Constraints from the existing code:

- `src/keywords/registry.ts` is the single source of truth for completion and
  hover. `keywordsForScope('version')` currently returns an empty array. The
  scanner already labels `VERSION` braces as the `version` scope, and a nested
  unlabelled brace inside a `VERSION` block repeats the enclosing scope, so no
  scanner change is needed.
- `src/keywords/lookup.ts` builds `keywordWordPattern()` from registry ids. Ids
  are matched case-sensitively, so lower-case `global`/`local`/`extern` do not
  collide with the existing upper-case `EXTERN` command.
- The registry caps (`SUMMARY_MAX_LENGTH` 160, `EXAMPLE_MAX_LENGTH` 200,
  `EXAMPLE_MAX_LINES` 4, spaces instead of tabs, one sentence ending in a full
  stop) and the GFDL provenance rule apply to every new entry.
- `syntaxes/linker-script.tmLanguage.json` already has `#version-node`,
  `#version-node-body` and `#version-body`. Leaf scopes end in `.ld`; the root
  `source.linker-script` is the only exception. Patterns stay anchored on
  `\b`/lookbehind and never nest a quantifier over a self-overlapping class.
- `scripts/check-grammar-fixtures.mjs` already enforces that every non-space
  character of a fixture source line sits inside an inline `^` assertion and that
  leaf `name` fields end in `.ld`. New fixture lines must satisfy both checks.

## Goals / Non-Goals

**Goals:**

- Make the `version` scope useful: three real version-script commands, each with
  a snippet, summary, example, kind and the `version` scope.
- Cover the remaining version-script constructs (extern language blocks, node
  inheritance, symbol wildcards) with grammar scopes and fixture assertions.
- Keep the spec wording truthful about the regression mechanism.

**Non-Goals:**

- Completion for user-defined version node names, symbol names, or file names.
  README documents that those are not completed; the registry stays a keyword
  list.
- Any change to scope scanning, hover rendering, completion rendering, or the
  build/toolchain.
- New scope names: existing `.ld` families are reused.

## Decisions

### Registry: three lower-case commands

Add `global` (keyword), `local` (keyword) and `extern` (command), each with
`scopes: ['version']`. GNU ld version scripts spell these in lower case; keeping
that spelling makes the inserted snippets valid and avoids shadowing the
upper-case `EXTERN(symbol)` command. Snippets use a single tab stop for the
symbol list and keep a multi-line brace body so `deriveSignature` collapses it to
`{ ... }`.

`global` and `local` snippets are one-line labels (`global: ${1:symbol};`);
`extern` opens a braced language block (`extern "${1:C++}" {\n\t${2:symbol};\n};`).
Summaries and examples are authored for this project, one sentence each, within
the caps, with no wording taken from the GNU ld manual.

### Grammar: a region for the extern block

`#version-node-body` currently matches `\b(?:global|local)\b` as
`keyword.other.version.ld`, then any bare identifier as `entity.name.symbol.ld`.
Add `extern` to the keyword family so it is not colored as a symbol, and add a
`#version-extern` region that begins at `extern` plus a quoted language string
and ends at the matching `}`. Giving the extern block its own region keeps the
parent version node's `end: \}` from firing on the nested brace. Both braces are
scoped as `punctuation.section.block.*.ld`, the quoted language as
`string.quoted.double.ld`, and identifiers inside as `entity.name.symbol.ld`.

Version node inheritance (`V2.0 { } V1.0;`) is already emitted by
`#version-node`'s optional `(\{)?` group, and `*` is already
`keyword.operator.wildcard.ld` via `#operators`. Fixtures assert these rather
than adding new grammar rules.

### Fixtures

Extend `test/grammar/version.ld` with an extern language block, a node with a
parent, and a wildcard symbol, annotating every non-space character with an
inline assertion. Keep the existing `^` column discipline.

### Documentation and spec sync

- `keyword-completion` and `syntax-highlighting` deltas are synced into
  `openspec/specs/` by the opsx workflow; do not hand-edit the main specs.
- README's "One block has no entries yet" limitation and the "69 registered
  keywords" count are updated; CHANGELOG gains an Unreleased entry; AGENTS.md's
  architecture notes and the publishing-status note are updated.
- Two archived design notes name a `documentation` registry field that never
  shipped; they are corrected as a one-off documentation erratum, with the
  archived change otherwise left intact.

## Risks / Trade-offs

- [Lower-case ids look different from the rest of the registry] -> They mirror
  the real syntax and avoid an id collision; a unit test asserts the exact ids.
- [`extern` as a bare word could be colored as a symbol elsewhere] -> The match
  is anchored on `\b` and lives only in `#version-node-body`; top-level `EXTERN`
  keeps its command scope.
- [Extern region nested braces unbalance the grammar] -> The region owns its
  brace; malformed fixtures continue to prove the grammar ends at EOF.

## Open Questions

None. The scope boundary (no completion for user-defined names) follows the
existing documented limitation and was confirmed before implementation.
