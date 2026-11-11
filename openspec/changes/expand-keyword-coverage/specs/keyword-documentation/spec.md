# Spec Delta

## MODIFIED Requirements

### Requirement: Keyword hover content

The extension SHALL show a hover when the cursor is over a word that matches a keyword in the registry, containing the keyword signature, a one-sentence summary, and a short usage example.

#### Scenario: Hovering a function keyword

- **WHEN** the cursor is over `ALIGN` inside a linker script
- **THEN** the hover shows `ALIGN(expression)`, a summary of what it does, and an example of its use

#### Scenario: Hovering a block keyword

- **WHEN** the cursor is over `MEMORY`
- **THEN** the hover shows the block form and a summary that the block declares memory regions

#### Scenario: Hovering a multi-scope keyword

- **WHEN** the cursor is over `PROVIDE`, which is legal at top level, directly inside `SECTIONS`, in an output section body, and in an overlay
- **THEN** the hover describes every one of those placements rather than only some of them

### Requirement: No hover outside the registry

The extension SHALL return no hover result for words that are not registered keywords.

#### Scenario: Symbol name

- **WHEN** the cursor is over a user-defined symbol such as `__stack_top`
- **THEN** no hover is shown

#### Scenario: Section name

- **WHEN** the cursor is over `.text` in an output section description
- **THEN** no hover is shown, because output section names are user-defined