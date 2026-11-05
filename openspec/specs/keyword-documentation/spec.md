# keyword-documentation Specification
## Purpose

Define the hover experience for linker script keywords, including what is shown, when nothing is shown, and where the text may come from.

## Requirements

### Requirement: Keyword hover content

The extension SHALL show a hover when the cursor is over a word that matches a keyword in the registry, containing the keyword signature, a one-sentence summary, and a short usage example.

#### Scenario: Hovering a function keyword

- **WHEN** the cursor is over `ALIGN` inside a linker script
- **THEN** the hover shows `ALIGN(expression)`, a summary of what it does, and an example of its use

#### Scenario: Hovering a block keyword

- **WHEN** the cursor is over `MEMORY`
- **THEN** the hover shows the block form and a summary that the block declares memory regions

#### Scenario: Hovering a multi-scope keyword

- **WHEN** the cursor is over `PROVIDE`, which is legal both at top level and inside `SECTIONS`
- **THEN** the hover describes both placements rather than only one

### Requirement: No hover outside the registry

The extension SHALL return no hover result for words that are not registered keywords.

#### Scenario: Symbol name

- **WHEN** the cursor is over a user-defined symbol such as `__stack_top`
- **THEN** no hover is shown

#### Scenario: Section name

- **WHEN** the cursor is over `.text` in an output section description
- **THEN** no hover is shown, because output section names are user-defined

### Requirement: Original documentation text

Keyword documentation MUST be authored originally and MUST NOT reproduce text from the GNU ld manual, which is licensed under the GNU Free Documentation License and is not compatible with this project's license.

#### Scenario: Documentation review

- **WHEN** a new keyword's documentation is added
- **THEN** its summary and example are original prose or a constructed example, not a copied passage

### Requirement: Hover availability across supported language ids

The extension SHALL provide identical hover behavior for documents whose language id is `linker-script` or `ld`.

#### Scenario: Compatibility language id

- **WHEN** a linker script document is associated with the `ld` language id by another extension
- **THEN** hovering a keyword still shows the same documentation
