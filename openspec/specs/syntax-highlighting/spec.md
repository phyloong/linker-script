# syntax-highlighting Specification
## Purpose

Define which parts of a GNU linker script receive syntax highlighting and how that highlighting is verified against regressions.

## Requirements

### Requirement: Grammar registration

The extension SHALL contribute a TextMate grammar for the `linker-script` language whose root scope is `source.linker-script`.

#### Scenario: Opening a linker script

- **WHEN** a `.lds` or `.ld` file is associated with `linker-script`
- **THEN** its tokens are highlighted according to the contributed grammar, not rendered as plain text

### Requirement: Lexical coverage

The grammar SHALL distinguish comments, strings, numeric literals, operators, and linker commands.

#### Scenario: Block comment

- **WHEN** a script contains `/* comment */`
- **THEN** the comment span receives a comment scope and does not affect the highlighting of the following line

#### Scenario: Numeric literals

- **WHEN** a script contains `0x8000`, `64K`, `1M`, and `010`
- **THEN** each is scoped as a numeric constant, including its size suffix

#### Scenario: Top-level command

- **WHEN** a script contains `ENTRY(_start)` at top level
- **THEN** `ENTRY` receives a command scope and `_start` is not scoped as a command

### Requirement: Structural coverage

The grammar SHALL distinguish block bodies and their internal constructs for `SECTIONS`, `MEMORY`, `PHDRS`, `VERSION`, and `OVERLAY`.

#### Scenario: Output section header

- **WHEN** a script contains `.text : { ... } > FLASH AT> ROM`
- **THEN** `.text` is scoped as a section name, and `> FLASH` and `AT> ROM` are scoped as region markers

#### Scenario: Input section exclusion

- **WHEN** a script contains `*(.text* !.text.boot)`
- **THEN** the leading `!` is scoped as an exclusion operator distinct from the section pattern

#### Scenario: Memory region attributes

- **WHEN** a script contains `FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 512K`
- **THEN** `FLASH` is scoped as a region name, `(rx)` as attributes, and `ORIGIN`/`LENGTH` as region fields

#### Scenario: Program header entry

- **WHEN** a `PHDRS` block contains `text PT_LOAD FILEHDR PHDRS FLAGS(5);`
- **THEN** the name, type, flags, and flags argument each receive distinct scopes

#### Scenario: Version block

- **WHEN** a `VERSION` block contains `{ global: foo; local: *; };`
- **THEN** `global`/`local` are scoped as version keywords and the symbol list is scoped separately

### Requirement: Scope naming compatibility

Leaf token scopes SHALL end with the `.ld` segment so that themes and user overrides written for linker script tokens continue to match.

#### Scenario: Existing theme rule

- **WHEN** a user has a `textMateRules` entry targeting a linker script token scope ending in `.ld`
- **THEN** that rule applies to the corresponding token produced by this grammar

### Requirement: Grammar regression tests

The extension SHALL include snapshot tests covering every construct listed in the lexical and structural requirements.

#### Scenario: Deliberate regression

- **WHEN** a grammar regex is changed so a previously scoped token loses its scope
- **THEN** the snapshot test fails and names the affected fixture line
