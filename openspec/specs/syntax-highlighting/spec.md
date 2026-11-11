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

The extension SHALL include grammar fixtures with inline scope assertions covering
every construct listed in the lexical and structural requirements. A companion
check SHALL reject a fixture line whose non-space characters are not all inside an
assertion, and SHALL reject a `#include` with no repository entry.

#### Scenario: Deliberate regression

- **WHEN** a grammar regex is changed so a previously scoped token loses its scope
- **THEN** the affected fixture's inline assertion fails and names the fixture line

#### Scenario: Fixture completeness

- **WHEN** a fixture source line contains a non-space character outside every assertion
- **THEN** the companion check fails and names that fixture line

### Requirement: Version script structural coverage

The grammar SHALL distinguish version node names, visibility commands, extern
language blocks, symbol patterns and wildcards inside a `VERSION` block. It SHALL
keep closing braces balanced when an extern block is nested inside a version node,
and SHALL not let an inheritance reference whose terminator shares its line open a
region of its own.

#### Scenario: Extern language block

- **WHEN** a `VERSION` block contains `extern "C++" { "foo()"; };`
- **THEN** `extern` receives a version keyword scope, the language string a string scope, and the braces punctuation scopes, and the enclosing version node stays open until its own closing brace

#### Scenario: Version node inheritance

- **WHEN** a `VERSION` block contains `V2.0 { } V1.0;`
- **THEN** both version node names are scoped as version tags, and the reference opens no region of its own

#### Scenario: Inheritance followed by another node

- **WHEN** a `VERSION` block contains an inherited node reference and a further node declaration after it
- **THEN** the reference is scoped as a version tag, the following node keeps its version tag scope, and the body of that node keeps its command and symbol scopes

#### Scenario: Brace on the next line

- **WHEN** a version node writes its name on one line and its opening brace on the next
- **THEN** the name is scoped as a version tag, the brace as a block begin, and the node body keeps its command and symbol scopes

#### Scenario: Comment between the name and the brace

- **WHEN** a version node writes `V6.0 /* gap */ {`
- **THEN** the name is scoped as a version tag, the comment keeps its comment scope, the brace is a block begin, and the node body keeps its scopes

#### Scenario: Comment before a reference terminator

- **WHEN** a `VERSION` block contains `V1.0 { } V0.1 /* parent */ ;`
- **THEN** the comment keeps its comment scope and the reference is scoped as a version tag

#### Scenario: Symbol wildcard

- **WHEN** a version node contains `local: *;`
- **THEN** `*` is scoped as a wildcard operator and `;` as a statement terminator

### Requirement: Keyword set alignment between grammar and registry

Every keyword the extension documents SHALL be coloured by the grammar, and every keyword
the grammar colours by an explicit alternation SHALL either be documented or be declared as
a deliberate exception. A keyword covered only by a catch-all pattern SHALL be declared,
together with the pattern that covers it.

#### Scenario: Documented keyword with no colour

- **WHEN** a keyword is added to the registry but no grammar pattern matches it
- **THEN** the alignment check fails and names that keyword and the table to update

#### Scenario: Coloured keyword with no documentation

- **WHEN** the grammar colours a keyword that is absent from the registry and from the declared exceptions
- **THEN** the alignment check fails and names that keyword

#### Scenario: Catch-all coverage is declared

- **WHEN** a registry keyword is coloured only by a catch-all pattern such as the program-header prefix or the region-attribute letter class
- **THEN** the keyword appears in the declared coverage table and the check passes

### Requirement: Longest alternative first in keyword alternations

Within any grammar alternation of keyword spellings, no alternative SHALL be a prefix of a
later alternative, so a shorter spelling can never consume the start of a longer one.

#### Scenario: Long spelling ordered before its prefix

- **WHEN** an alternation lists `PROVIDE_HIDDEN` and `PROVIDE`
- **THEN** `PROVIDE_HIDDEN` precedes `PROVIDE` and the ordering check passes

#### Scenario: Prefix placed first

- **WHEN** an alternation lists a spelling before a longer spelling that starts with it
- **THEN** the ordering check fails and names both spellings
