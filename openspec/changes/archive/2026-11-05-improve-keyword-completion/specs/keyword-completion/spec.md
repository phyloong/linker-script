# Spec Delta

## Purpose

Define the completion behavior for linker script files: which keywords are offered, how the enclosing block narrows that set, and what text each one inserts.

## ADDED Requirements

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
