# Design

## Context

See proposal.md - Why. Constraints from prerequisite changes:

- The registry entry from `improve-keyword-completion` already carries `snippet`, `id`, `kind`, `scopes`, and a `documentation` field reserved for this change.
- The language configuration defines a word pattern that keeps dotted section names and underscored commands together, but the hover provider still needs its own range check so it does not fire on arbitrary substrings.

## Goals / Non-Goals

**Goals:**

- Documentation lives in exactly one place and is reused by completion details later.
- Hover is fast: a map lookup on a word, no scanning.
- Text stays short enough to read in a tooltip.

**Non-Goals:**

- Links into the GNU manual, version annotations, or `since` metadata.
- Hover for symbols, section names, memory region names, or file names.
- Localization.

## Decisions

### Signature derived from the snippet

The registry stores one snippet per keyword. The signature shown in hover is produced by stripping `${n:default}` placeholders down to their defaults (or to the argument name) and collapsing a block body to `{ ... }`.

Alternative rejected: a separate `signature` field. It is a second place to forget when a snippet changes, and the registry already encodes the shape.

A keyword may override the derived signature when the collapse reads badly; the override is optional and, if absent, is computed.

### Markdown with fenced code blocks, untrusted

Hover content is a `MarkdownString` with `isTrusted` left false, because no command links are needed. Sections: signature in a fenced block, summary as text, example in a fenced block.

### Range check against registry ids

`getWordRangeAtPosition` is called with a regex built from registry ids rather than the document's default word pattern, so a hover over `ALIGN` inside `ALIGN(0x100)` resolves to the whole token while a hover over part of a longer identifier does not.

### Documentation content lives beside the entry

Each registry entry gains `summary` and `example` strings. Keeping them next to the snippet means a reviewer sees the whole keyword in one diff.

## Risks / Trade-offs

- [Hover fires on keyword substrings inside identifiers] -> The id-based range check rejects partial matches.
- [Documentation drifts from the snippet] -> Signature is derived from the snippet, so only summaries and examples can drift; a unit test asserts every entry has both and that every entry's signature is non-empty.
- [Copied manual text sneaks in during authoring] -> Recorded as a spec requirement and checked during review; no automated license scanner is added.
- [Long hover text becomes unreadable] -> Summaries are capped at one sentence and examples at a few lines; a unit test enforces a maximum length per field.
