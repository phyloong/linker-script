# Design

## Context

See proposal.md - Why. What the design has to work with:

- `src/keywords/registry.ts` holds 72 entries with `kind`, `scopes`, `summary`,
  `example`; it imports nothing from `vscode`, so plain-Node tests already read it.
- `syntaxes/linker-script.tmLanguage.json` contains 51 `match`/`begin` strings across 31
  repository entries. Keyword spellings appear as alternations in 7 of them, and three
  families are covered by catch-all patterns instead.
- `src/test/grammar/*.ld` pin the exact scope of 45 of the 72 ids; the other 27 ids appear
  in no fixture.
- `src/test/unit/keywords.test.ts` freezes the total (72) and a 51-entry historical list.
- Nothing compares the registry and the grammar. `check-grammar-fixtures.mjs` validates
  fixture coverage and the `.ld` scope suffix; `keywords.test.ts` validates registry
  internals. Both stay green while the two keyword sets diverge.

Measured asymmetry today (audit run over the current grammar):

| Kind | Count | Coloured by |
| --- | --- | --- |
| block, command, function | 45 | explicit alternation |
| keyword | 17 | 10 explicit, 7 catch-all (`DISCARD`, `R W X A I L`) |
| field | 10 | 3 explicit (`ORIGIN`, `LENGTH`, `SIZEOF_HEADERS`), 7 catch-all (`PT_*`) |

Grammar tokens with no registry entry: `AT`, `FLAGS`, `FILEHDR`, plus four spellings
`org`, `o`, `len`, `l` produced by the case-insensitive region-field alternation.

## Goals / Non-Goals

**Goals**

- One test that fails when either side gains or loses a keyword without the other.
- Zero change to the shipped grammar, the registry, or the bundle.
- Extracting keyword lists without hardcoding where they live, so a grammar restructure
  does not silently disable the check.

**Non-Goals**

- Detecting a keyword that moved to a different scope family (e.g. `QUAD` from `#commands`
  to `#expressions`). Fixtures cover that for 45 ids; the remaining 27 stay uncovered.
- Generating the grammar's alternations from the registry.
- Removing the frozen counts and historical list in `keywords.test.ts`.

## Decisions

**1. A test, not a generator.** Generating alternations from the registry would shrink the
grammar to the documented set and lose the colouring of valid-but-undocumented syntax
(`PT_GNU_STACK`, `.foo (SOMETYPE) :`, arbitrary region attribute letters). The two sets are
meant to differ; what is missing is a check that they differ deliberately.
*Alternative rejected:* a build step emitting the tmLanguage file.

**2. Three assertions, no scope map.** T1 asserts every registry id is coloured. T2 asserts
every explicitly listed grammar keyword is documented or excepted. T3 asserts no alternative
is a prefix of a later one. No `kind → scope` mapping is introduced: it would duplicate
grammar knowledge, and `field` already splits three ways
(`keyword.other.region-field.ld`, `support.type.program-header.ld`,
`support.function.ld`). *Alternative rejected:* an optional `grammarScope` field per entry;
that is the generator's input, not the checker's.

**3. Exceptions live in the test, not the registry.** The registry stays about completion
and hover. The three tables are read by nothing else, so shipping them would be dead weight.
If generation ever happens, these tables become its input.

**4. Self-identifying extraction.** The test walks every `match`/`begin` string and treats a
group as a keyword list only when it is a non-capturing group whose alternatives are all bare
words. No list of rule paths is hardcoded, so moving a rule between repository entries keeps
working. *Alternative rejected:* enumerating the 7 alternation paths by hand.

**5. Strip character classes and escapes before searching for a token.** Without this,
`[A-Za-z_]` makes the id `A` look like a literal and hides a real gap: the audit initially
reported 13 uncoloured ids, and the stripped run found 14.

**6. Skip any group containing a `_`-terminated fragment.** `(?:\s+(?:PT_|FILEHDR|PHDRS|AT|FLAGS))`
is a lookahead hint for naming a segment, not a keyword list; taken at face value it invents a
`PT_` keyword. The three real words still come from the two dedicated groups beside it.

**7. Each catch-all declaration is verified, not just trusted.** A `GENERIC_COVERAGE` row
names the id, a fragment that must still appear in some pattern, and the scope that pattern
must produce. A tightened catch-all therefore breaks the test instead of leaving a stale
declaration behind. *Trade-off:* 14 rows instead of 14 bare names.

**8. Spelling variants map to canonical ids.** `SPELLING_VARIANTS` is keyed by the grammar
token and valued by an id that must exist in the registry, which states the relationship
instead of allowing four unexplained strings.

**9. A unit suite, not the fixture script.** `check-grammar-fixtures.mjs` is a standalone ESM
script that reads fixtures; the unit suites already read JSON from disk through
`path.join(__dirname, '..', '..', '..')` (`language.test.ts`), and `test:extension` runs
`dist/**/*.test.js` as well, so one file lands in both chains with no script changes.

## Risks / Trade-offs

- **The extractor misses a keyword list written in another shape** (a capturing group, or a
  list mixed with escapes) → T2 cannot see those tokens. Mitigation: T1 is unaffected, the
  shape rule is stated in a comment at the extraction helper, and `AGENTS.md` records that a
  new keyword family needs the same alternation shape.
- **The 14 declarations rot when a catch-all changes** → decision 7 checks both the fragment
  and the scope, so a tightened pattern fails T1 rather than passing quietly.
- **Ordering check only sees pure-word alternations** → a mixed pattern can still shadow a
  spelling. Accepted: the only mixed pattern that lists keywords is the lookahead hint skipped
  by decision 6.
- **A false sense of completeness.** The suite proves set membership, not that a keyword is
  coloured in the right place. Mitigation: `Non-Goals` and the test's header comment say so.

## Migration Plan

None. Nothing shipped changes; the suite is additive and runs in the existing `test:unit` and
`test:extension` chains.
