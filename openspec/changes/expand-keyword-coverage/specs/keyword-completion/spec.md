# Spec Delta

## MODIFIED Requirements

### Requirement: Context-sensitive filtering

The extension SHALL restrict completion items to those permitted in the block enclosing the cursor.

#### Scenario: Inside MEMORY

- **WHEN** the cursor is inside a `MEMORY` block
- **THEN** `ORIGIN`, `LENGTH`, and region attributes are offered, and block keywords such as `SECTIONS` and `PHDRS` are not

#### Scenario: Inside an output section body

- **WHEN** the cursor is inside `SECTIONS { .text : { <cursor> } }`
- **THEN** input section descriptions, data commands, the expression functions that are legal there, and the `ASSERT`, `PROVIDE` and `PROVIDE_HIDDEN` commands are offered, and block keywords such as `SECTIONS` and `MEMORY` are not

#### Scenario: At the output section level

- **WHEN** the cursor is directly inside `SECTIONS` but outside any section body
- **THEN** output section syntax, `PROVIDE`, `ASSERT`, `KEEP`, `SORT`, and `/DISCARD/` are offered, and data commands are not

## ADDED Requirements

### Requirement: Program header modifier completion

Inside a `PHDRS` block the extension SHALL offer the program header types together with the `FILEHDR` and `FLAGS` modifiers, and SHALL NOT offer block keywords or data commands there.

#### Scenario: Program header modifiers

- **WHEN** the cursor starts a program header entry inside `PHDRS { <cursor> }`
- **THEN** `FILEHDR` and `FLAGS` are offered beside the program header types

#### Scenario: Flags argument

- **WHEN** the user accepts the `FLAGS` item
- **THEN** the inserted text is a `FLAGS` call whose argument is a tab stop

### Requirement: Input section filter completion

Inside an output section body the extension SHALL offer `EXCLUDE_FILE` and `SORT_NONE` beside the section-sorting commands, and each item SHALL insert a call whose argument is a tab stop.

#### Scenario: File exclusion filter

- **WHEN** the cursor is inside an output section body and the user requests completion
- **THEN** `EXCLUDE_FILE` is offered and inserts a call whose file name is the first tab stop

#### Scenario: Sorting override

- **WHEN** the user accepts the `SORT_NONE` item
- **THEN** the inserted text is a `SORT_NONE` call whose input section pattern is a tab stop

### Requirement: Builtin function placement

The extension SHALL offer `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_RELRO_END` only directly inside `SECTIONS`, and SHALL offer `CONSTANT` and `SEGMENT_START` at top level, in `SECTIONS`, in an output section body, and in an overlay.

#### Scenario: Data segment alignment

- **WHEN** the cursor is directly inside `SECTIONS` but outside any section body
- **THEN** `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_RELRO_END` are offered

#### Scenario: Data segment function inside a section body

- **WHEN** the cursor is inside an output section body
- **THEN** `DATA_SEGMENT_ALIGN` and `DATA_SEGMENT_RELRO_END` are not offered, because `ld` accepts them only directly inside `SECTIONS`

#### Scenario: Symbolic constant

- **WHEN** the cursor is inside an output section body
- **THEN** `CONSTANT` is offered

#### Scenario: Segment base address

- **WHEN** the cursor is at the top level and the user requests completion
- **THEN** `SEGMENT_START` is offered