# Spec Delta

## Purpose

Cover the remaining version-script constructs with grammar scopes and fixtures,
and name the regression mechanism the project actually uses.

## ADDED Requirements

### Requirement: Version script structural coverage

The grammar SHALL distinguish version node names, visibility commands, extern
language blocks, symbol patterns and wildcards inside a `VERSION` block, and SHALL
keep closing braces balanced when an extern block is nested inside a version node.

#### Scenario: Extern language block

- **WHEN** a `VERSION` block contains `extern "C++" { "foo()"; };`
- **THEN** `extern` receives a version keyword scope, the language string a string scope, and the braces punctuation scopes, and the enclosing version node stays open until its own closing brace

#### Scenario: Version node inheritance

- **WHEN** a `VERSION` block contains `V2.0 { } V1.0;`
- **THEN** both version node names are scoped as version tags

#### Scenario: Symbol wildcard

- **WHEN** a version node contains `local: *;`
- **THEN** `*` is scoped as a wildcard operator and `;` as a statement terminator

## MODIFIED Requirements

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
