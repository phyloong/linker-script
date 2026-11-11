# Spec Delta

## MODIFIED Requirements

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