# Proposal

## Why

`#version-node` begins a region on any identifier with an **optional** `{` but ends only on `}`. An inheritance reference such as `V2.0 { } V1.0;` therefore opens a brace-less region that runs until the next `}` it can find. The current fixture cannot see this: the reference is the last construct before the VERSION block's closing brace, and both closing braces carry `punctuation.section.block.end.ld`, so the assertion passes whether the nesting is right or wrong. Add one more node after the reference and that node is coloured as a symbol, with its opening brace ending the phantom region.

## What Changes

- Require the brace in the node rule so a bare identifier cannot start a node region, and add a separate rule for the parent reference at version-body level, scoped as a version tag.
- Extend `test/grammar/version.ld` with three nodes where one inherits and another follows the reference, so the mis-colouring fails before the fix.
- Add the multi-node inheritance case to the syntax-highlighting requirement that already covers a single inheritance.

Not in scope: completion for node names (they are user-defined and the keyword-completion spec forbids offering them), and any change to `VERSION` completion.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `syntax-highlighting`: the version-script structural requirement gains a case for an inheritance reference that is followed by another node.

## Impact

- `syntaxes/linker-script.tmLanguage.json`: the `version-node` begin pattern and one new pattern in `#version-body`.
- `test/grammar/version.ld`: additional assertion lines.
- No registry change, no test-suite count change, no runtime behavior outside colouring.