# Proposal

## Why

The keyword list exists twice: `src/keywords/registry.ts` drives completion and hover,
while `syntaxes/linker-script.tmLanguage.json` drives colour. No test compares them, so
either half can be edited alone and the result still passes `npm test`. A registry entry
with no grammar token completes but never colours; a grammar token with no registry entry
colours but never completes or hovers. Both failures are silent, and the second one is the
easier mistake because documentation is the visible task while colouring is not.

A manual audit found the seam already exists in the shipped grammar: 14 registry ids are
coloured only by catch-all patterns, 3 grammar keywords have no registry entry, and one
grammar rule lists 4 alternate spellings of two documented fields.

## What Changes

- Add a plain-Node unit suite, `src/test/unit/grammar-sync.test.ts`, that parses the
  grammar JSON and asserts three invariants:
  - every registry keyword is coloured by some grammar pattern;
  - every keyword coloured by an explicit grammar alternation is in the registry or
    in a declared exception;
  - within an alternation, no alternative is a prefix of a later alternative, so
    `PROVIDE_HIDDEN` can never be shadowed by `PROVIDE`.
- Declare the existing asymmetry in three tables inside that suite instead of changing the
  grammar or the registry: `GENERIC_COVERAGE` (14 ids, each with the pattern that colours
  it), `SPELLING_VARIANTS` (4 spellings mapped to the canonical ids) and `GRAMMAR_ONLY`
  (3 keywords coloured but not documented).
- Add a requirement to the `syntax-highlighting` spec stating the alignment invariant and
  its verification, with one scenario per assertion.
- List the new suite in the unit-test inventory in `AGENTS.md`.

No grammar pattern, registry entry, or shipped behaviour changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `syntax-highlighting`: adds a requirement that the grammar's keyword set and the
  registry's keyword set stay aligned in both directions, and that no alternation
  alternative shadows a longer one, verified by a unit test rather than by a fixture.

## Impact

- New file: `src/test/unit/grammar-sync.test.ts`.
- Modified: `AGENTS.md` (unit-suite inventory), `openspec/specs/syntax-highlighting/spec.md`.
- No change to `dist/extension.js`, the shipped grammar, the registry, or dependencies; the
  suite reads files from disk and is picked up by both `test:unit` and `test:extension`
  through the existing `dist/**/*.test.js` glob.
