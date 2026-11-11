# Spec Delta

## ADDED Requirements

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

