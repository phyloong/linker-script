# Tasks

## 1. Grammar skeleton

- [x] 1.1 Create `syntaxes/linker-script.tmLanguage.json` with root scope `source.linker-script`, a comment pattern, and a string pattern; verify a fixture with comments and strings produces the expected scopes.
- [x] 1.2 Add numeric literal patterns for decimal, hex, octal, and `K`/`M` suffixes; verify each form in a fixture.
- [x] 1.3 Register the grammar in `contributes.grammars` and confirm `vsce ls` includes the syntaxes directory.

## 2. Commands and blocks

- [x] 2.1 Add the top-level command patterns with a shared include; verify `ENTRY`, `OUTPUT_FORMAT`, `MEMORY`, `PHDRS`, and `SECTIONS` are scoped and their arguments are not.
- [x] 2.2 Add the `SECTIONS` block scope: output section names, the colon, section bodies, input patterns, `*(...)`, exclusion `!`, `>region`, `AT>`, `/DISCARD/`; verify with a representative section fixture.
- [x] 2.3 Add the `MEMORY` block scope: region name, attributes including `!` exclusion, `ORIGIN`, `LENGTH`; verify with a memory fixture.
- [x] 2.4 Add the `PHDRS` block scope: entry name, `PT_*` types, `FILEHDR`, `PHDRS`, `AT()`, `FLAGS()`; verify with a phdrs fixture.
- [x] 2.5 Add the `VERSION` and `OVERLAY` block scopes; verify with one fixture each.

## 3. Regression tests

- [x] 3.1 Add `vscode-tmgrammar-test` fixtures covering every construct in the spec and wire them into the test script; verify the suite passes on the finished grammar.
- [x] 3.2 Add fixtures for malformed input (unterminated comment, unbalanced braces, stray `}`) and verify highlighting degrades without hanging.
- [x] 3.3 Verify the suite fails when a scope is deliberately removed from one pattern, then restore it.

## 4. Visual verification

- [x] 4.1 Render a complete sample linker script in the extension development host under a light and a dark theme; verify every construct is distinguishable and no token is left unstyled by mistake.
- [x] 4.2 Record the scope names in `AGENTS.md` so later changes keep the convention; verify the documented names match the grammar file.
