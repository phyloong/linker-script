# language-support Specification

## Purpose

Define how linker script files are recognized, activated, and edited, so that language features apply to the right files and never to unrelated plain-text documents.

## Requirements

### Requirement: Linker script language contribution

The extension SHALL contribute a language with id `linker-script`, display aliases, and file associations for `.lds` and `.ld`.

#### Scenario: Opening a linker script file

- **WHEN** a file named `link.lds` or `link.ld` is opened and no other extension claims the association
- **THEN** the document language id is `linker-script`

#### Scenario: Unrelated text files are untouched

- **WHEN** a file with a language id other than `linker-script` or `ld` is opened
- **THEN** the extension contributes no completion items and no hover content to that document

### Requirement: Activation on linker script files

The extension SHALL activate when a document of language `linker-script` or `ld` is opened, including a single file opened without a workspace folder.

#### Scenario: Single file without a workspace

- **WHEN** a user opens only `link.lds` with no folder open
- **THEN** the extension activates and provides completion for that document

#### Scenario: Compatibility language id

- **WHEN** a document's language id is `ld` because another extension owns the file association
- **THEN** the extension activates and provides the same completion and hover behavior as for `linker-script`

### Requirement: Editor configuration for linker scripts

The contributed language SHALL provide a configuration that treats `/* */` as the comment syntax and preserves linker-specific words as single tokens.

#### Scenario: Comment toggling

- **WHEN** the user invokes toggle line comment inside a linker script
- **THEN** the inserted or removed markup is a block comment `/* */`, not a line comment

#### Scenario: Word selection

- **WHEN** the user double-clicks `SORT_BY_NAME` or `.text.foo`
- **THEN** the selection covers the whole identifier including underscores and interior dots

### Requirement: Declared minimum editor version

The extension SHALL declare `engines.vscode` of `^1.74.0` or higher and MUST NOT use APIs newer than that version.

#### Scenario: Installation on an older editor

- **WHEN** a user on VS Code 1.73 or older browses the extension
- **THEN** the marketplace marks the extension as incompatible rather than installing it
