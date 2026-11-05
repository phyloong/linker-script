# Design

## Context

See proposal.md - Why. Constraints:

- The language contribution exists in `add-linker-script-language`; this change only adds the grammar and its tests.
- Another popular extension registers a grammar with root scope `source.ld` for the same file types. Both can be installed, but only one grammar applies to a given document.
- TextMate grammars are regular expressions evaluated line by line; there is no AST and no semantic feedback.

## Goals / Non-Goals

**Goals:**

- Full structural coloring that matches the class of highlighting a dedicated grammar extension provides.
- Scope names that a theme can target without special-casing this extension.
- A test suite that fails on any unintended token change.

**Non-Goals:**

- Semantic highlighting, semantic tokens, or a language server.
- Grammar injection into Markdown or other hosts.
- Perfect handling of preprocessed `.lds.S` files, which are compiled as C sources.

## Decisions

### Distinct root scope, shared leaf vocabulary

Root scope is `source.linker-script` rather than `source.ld`. Two grammars claiming the same root scope in one editor is an avoidable conflict. Leaf scopes keep the `.ld` suffix (for example `keyword.control.command.ld`, `entity.name.section.ld`) so generic and linker-specific theme rules still match.

Trade-off: user overrides written against `source.ld ...` selectors will not match this grammar. That is accepted rather than copying another project's scope root.

### Structure-first, keyword-second

The grammar is organized by block: a repository section per block (`sections`, `memory`, `phdrs`, `version`, `overlay`) is included only while that block is open. Commands that are legal in many places live in a shared include.

Alternative rejected: one flat keyword list. It colors `ORIGIN` correctly only by accident and cannot distinguish a section body from a block body.

### Regex discipline

Every pattern is anchored on a word boundary and avoids nested quantifiers over overlapping character classes. Where a construct is ambiguous, the grammar prefers the shorter match and lets the next pattern continue, because a runaway regex degrades editor performance on every keystroke.

### Snapshot fixtures over assertions

`vscode-tmgrammar-test` fixtures annotate expected scopes inline. They double as documentation of the supported syntax and make a regression show the exact line that changed.

## Risks / Trade-offs

- [Catastrophic backtracking on a malformed line] -> Fixtures include unterminated comments and unbalanced braces; patterns avoid nested quantifiers.
- [Grammar diverges from the completion registry] -> Not enforced automatically; the snapshot fixtures and the registry are reviewed together in the release change.
- [Scope names chosen here constrain future themes] -> Accepted; the `.ld` suffix convention is the compatibility contract.
- [Two grammars installed at once] -> Only one applies per document; the README of the release change states the coexistence behavior rather than pretending there is none.

## Open Questions

- Whether `OVERLAY` and LLVM-specific extensions such as `ONLY_IF_RO` should be colored in the first release. They are included in the coverage requirement; if a construct turns out to be ambiguous against ordinary identifiers, it can be dropped without changing the grammar's structure.
