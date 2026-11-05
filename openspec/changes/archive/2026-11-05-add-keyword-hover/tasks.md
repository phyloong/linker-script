# Tasks

## 1. Provider

- [x] 1.1 Implement the hover provider: word range from a registry-derived regex, map lookup, and `MarkdownString` rendering; verify with a unit test that a known keyword produces a hover and an unknown word produces none.
- [x] 1.2 Derive the signature from the snippet and add the optional override path; verify `ALIGN`, `SECTIONS`, and `PROVIDE` each render a sensible signature.
- [x] 1.3 Register the provider for both `linker-script` and `ld`; verify the registration list covers `ld` and that the provider serves an `ld` document (a dev-host check is impossible here: VS Code rejects an unknown language id, so `ld` exists only when another extension contributes it).

## 2. Content

- [x] 2.1 Write summary and example for every registry entry, originally worded; verify a unit test asserts both fields are present, non-empty, and within the length caps.
- [x] 2.2 Review the multi-scope keywords (`PROVIDE`, `ASSERT`, `ALIGN`) so their documentation covers every placement; verify by hovering each in a sample script.
- [x] 2.3 Verify no documentation paragraph matches the GNU ld manual wording by spot-checking the longest entries against the manual's structure.

## 3. Integration

- [x] 3.1 Verify hover and completion agree on the same keyword set: every completion item has documentation and every hover keyword is offered by completion somewhere.
- [x] 3.2 Verify hover does not fire in a plain-text document or over a user-defined symbol.
- [x] 3.3 Document the hover behavior and the documentation provenance rule in `AGENTS.md`; verify the text matches the implemented behavior.
