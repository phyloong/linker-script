# Tasks

## 1. Provider

- [ ] 1.1 Implement the hover provider: word range from a registry-derived regex, map lookup, and `MarkdownString` rendering; verify with a unit test that a known keyword produces a hover and an unknown word produces none.
- [ ] 1.2 Derive the signature from the snippet and add the optional override path; verify `ALIGN`, `SECTIONS`, and `PROVIDE` each render a sensible signature.
- [ ] 1.3 Register the provider for both `linker-script` and `ld`; verify hover works after forcing a document to `ld`.

## 2. Content

- [ ] 2.1 Write summary and example for every registry entry, originally worded; verify a unit test asserts both fields are present, non-empty, and within the length caps.
- [ ] 2.2 Review the multi-scope keywords (`PROVIDE`, `ASSERT`, `ALIGN`) so their documentation covers every placement; verify by hovering each in a sample script.
- [ ] 2.3 Verify no documentation paragraph matches the GNU ld manual wording by spot-checking the longest entries against the manual's structure.

## 3. Integration

- [ ] 3.1 Verify hover and completion agree on the same keyword set: every completion item has documentation and every hover keyword is offered by completion somewhere.
- [ ] 3.2 Verify hover does not fire in a plain-text document or over a user-defined symbol.
- [ ] 3.3 Document the hover behavior and the documentation provenance rule in `AGENTS.md`; verify the text matches the implemented behavior.
