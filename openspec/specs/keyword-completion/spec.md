# keyword-completion Specification
## Purpose

Define the completion behavior for linker script files: which keywords are offered, how the enclosing block narrows that set, and what text each one inserts.

## Requirements

### Requirement: Keyword coverage

The extension SHALL offer completion for GNU linker script top-level commands, output section descriptions, data-emitting commands, expression functions, memory region attributes, and program header types.

#### Scenario: Top-level command

- **WHEN** the cursor is at the top level of a linker script and the user requests completion
- **THEN** `ENTRY`, `OUTPUT_FORMAT`, `OUTPUT_ARCH`, `INPUT`, `GROUP`, `SEARCH_DIR`, `STARTUP`, `ASSERT`, `EXTERN`, `INCLUDE`, `PROVIDE`, `PROVIDE_HIDDEN`, and `INSERT` are offered

#### Scenario: Data command inside a section body

- **WHEN** the cursor is inside an output section body
- **THEN** `BYTE`, `SHORT`, `LONG`, `QUAD`, `SQUAD`, `FILL`, and `ALIGN` are offered

### Requirement: Context-sensitive filtering

The extension SHALL restrict completion items to those permitted in the block enclosing the cursor.

#### Scenario: Inside MEMORY

- **WHEN** the cursor is inside a `MEMORY` block
- **THEN** `ORIGIN`, `LENGTH`, and region attributes are offered, and block keywords such as `SECTIONS` and `PHDRS` are not

#### Scenario: Inside an output section body

- **WHEN** the cursor is inside `SECTIONS { .text : { <cursor> } }`
- **THEN** input section descriptions and data commands are offered, and `PROVIDE` and `ASSERT` are not

#### Scenario: At the output section level

- **WHEN** the cursor is directly inside `SECTIONS` but outside any section body
- **THEN** output section syntax, `PROVIDE`, `ASSERT`, `KEEP`, `SORT`, and `/DISCARD/` are offered, and data commands are not

### Requirement: Degraded completion when context is uncertain

The extension SHALL return the unfiltered keyword list when the enclosing context cannot be determined.

#### Scenario: Unbalanced braces

- **WHEN** the scanned text contains a closing brace with no matching opening brace
- **THEN** completion returns all keywords rather than a guessed context's subset

#### Scenario: Unclosed block comment

- **WHEN** the text before the cursor ends inside an unterminated `/* `
- **THEN** completion returns all keywords

#### Scenario: External inclusion

- **WHEN** the current document contains an `INCLUDE` command before the cursor
- **THEN** completion returns all keywords, because the included file's content is unknown

#### Scenario: Cursor inside a comment or string

- **WHEN** the cursor is inside a comment or string literal
- **THEN** the extension returns no completion items

### Requirement: Correct snippet text

Each completion item SHALL insert syntactically valid linker script text with tab stops in place of arguments.

#### Scenario: VERSION block

- **WHEN** the user accepts the `VERSION` item
- **THEN** the inserted text opens a block with a placeholder body and a closing brace, with no newline embedded inside a placeholder

#### Scenario: Two-argument commands

- **WHEN** the user accepts `ASSERT`, `PROVIDE`, `PROVIDE_HIDDEN`, `MIN`, or `MAX`
- **THEN** the inserted text contains two tab stops in the correct argument positions

#### Scenario: Variadic commands

- **WHEN** the user accepts `GROUP` or `INPUT`
- **THEN** the inserted text shows at least one file placeholder and the syntax to add more

### Requirement: Item kinds reflect keyword category

The extension SHALL assign `CompletionItemKind` values that distinguish blocks, commands, expression functions, and region fields.

#### Scenario: Block versus function

- **WHEN** completion is displayed for a linker script
- **THEN** `SECTIONS`, `MEMORY`, `PHDRS`, and `VERSION` render as blocks, while `ALIGN` and `SIZEOF` render as functions

### Requirement: Completion inside VERSION

The extension SHALL offer the version-script visibility commands when the cursor
is inside a `VERSION` block, and SHALL NOT offer commands that belong to other
blocks there.

#### Scenario: Version script commands

- **WHEN** the cursor is inside `VERSION { <cursor> }` and the user requests completion
- **THEN** `global`, `local`, and `extern` are offered

#### Scenario: Other block commands are filtered out

- **WHEN** the cursor is inside a `VERSION` block
- **THEN** `ENTRY`, `SECTIONS`, and `INSERT` are not offered

#### Scenario: User-defined names are not completion items

- **WHEN** the cursor is inside a `VERSION` block
- **THEN** version node names and symbol patterns are not offered as completion items, because those names are user-defined

### Requirement: Version command snippets

Each version-script completion item SHALL insert syntactically valid version
script text with a tab stop in place of the symbol list, and SHALL carry an
originally worded summary and example.

#### Scenario: Visibility command

- **WHEN** the user accepts the `global` item
- **THEN** the inserted text opens a `global:` label followed by a symbol tab stop and a statement terminator

#### Scenario: Extern block

- **WHEN** the user accepts the `extern` item
- **THEN** the inserted text contains a language string and a braced symbol list

### Requirement: Hover follows the registry

The extension SHALL show a hover for each registered version-script command,
containing its derived signature, summary, and example.

#### Scenario: Hovering a version command

- **WHEN** the cursor is over `global` inside a linker script
- **THEN** the hover shows a signature, a summary, and an example for `global`
