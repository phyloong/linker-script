# Proposal: Complete VERSION-block completion

## Why

The `version` scope exists in the keyword registry and in the scope scanner, but no
keyword is registered for it, so completion inside a `VERSION` block returns an
empty list and the README records this as a known limitation. At the same time the
syntax-highlighting spec calls its regression fixtures "snapshot tests", while the
project actually verifies the grammar with inline scope assertions in `.ld`
fixtures. Both gaps make the shipped documentation describe behavior that the code
does not provide.

## What Changes

- Register the version-script visibility keywords `global`, `local`, and `extern`
  in the keyword registry with the `version` scope, so completion and hover answer
  inside `VERSION` blocks. They are spelled in lower case, matching GNU ld version
  script syntax; this also avoids a collision with the existing upper-case
  `EXTERN` top-level command.
- Extend the TextMate grammar to color `extern "C++" { ... }` regions, version-node
  inheritance, symbol patterns and wildcards, and extend the grammar fixtures so
  every non-space character of each source line sits inside an inline assertion.
- User-defined version node names and symbol names remain outside completion, as
  documented; they are covered by grammar scopes and fixtures only.
- Correct the syntax-highlighting requirement that refers to "snapshot tests" so it
  names the inline scope assertions the fixtures actually use.
- Update README, CHANGELOG and AGENTS.md so the shipped documentation matches the
  new behavior and the verified publishing status.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `keyword-completion`: add a requirement for completion inside `VERSION` blocks.
- `syntax-highlighting`: add version-script structural coverage and correct the
  grammar regression test wording.

## Impact

- Source and tests: `src/keywords/registry.ts`, `src/test/unit/keywords.test.ts`,
  `src/test/extension.test.ts`, `syntaxes/linker-script.tmLanguage.json`,
  `test/grammar/version.ld`, `scripts/check-grammar-fixtures.mjs`.
- Documentation: `README.md`, `CHANGELOG.md`, `AGENTS.md`,
  `openspec/specs/keyword-completion/spec.md`,
  `openspec/specs/syntax-highlighting/spec.md`, and the archived change design
  notes that name a registry field which does not exist.
- No runtime API changes and no new dependencies. Completion gains three keywords
  in the `version` scope only; the unfiltered fallback still returns the whole
  registry when the scope is uncertain.
