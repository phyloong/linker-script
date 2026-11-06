# Spec Delta

## Purpose

Extend completion coverage to the version-script commands that are legal inside a
`VERSION` block, so the `version` scope is no longer empty.

## ADDED Requirements

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
