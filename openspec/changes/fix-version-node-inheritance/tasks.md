# Tasks

## 1. Reproduce the phantom region

- [x] 1.1 Add a third version node after the inheritance reference in `test/grammar/version.ld`, with assertions that its name is `entity.name.tag.version.ld` and that the final closing brace stays `punctuation.section.block.end.ld`; verify with `npx vscode-tmgrammar-test "test/grammar/version.ld"` that the new assertions fail while the old ones still pass, which is the proof that the fixture now detects the defect.

## 2. Fix the node and reference rules

- [x] 2.1 Make the brace mandatory in the `version-node` begin pattern and add the `version-node-reference` rule to `#version-body` as specified in the design; verify with `npx vscode-tmgrammar-test "test/grammar/version.ld"` that every assertion passes, including the one added in 1.1.
- [x] 2.2 Verify with `npm run test:grammar` that the whole fixture suite and the completeness check pass, and confirm the reference rule adds no keyword alternation that the alignment suite would treat as a registry gap by running `npm run test:unit`.

## 3. Review follow-up

- [x] 3.1 Support a brace on the line after the node name, and a comment between the name and the brace, without letting the begin span a line break; verify with `npx vscode-tmgrammar-test "test/grammar/version.ld"` that the two new fixtures and the original ones pass.
- [x] 3.2 Tolerate a comment between a reference and its semicolon, and assert that reference form in the fixture; verify with the same command.
- [x] 3.3 Bring design.md and the delta in line with the rule that was actually implemented, including the inlined reference rule and the cross-line scenarios; verify with `openspec validate fix-version-node-inheritance --strict`.

## 4. Integration

- [x] 4.1 Run `npm test` and verify compile, unit, grammar and extension-host suites all pass with no change to completion or hover behavior.
- [x] 4.2 Verify the interactive claim without a GUI session: `test/grammar/version.ld` runs the real tokenizer over three nodes with an inheritance in the middle and asserts the tag, brace and body scopes; verify with `npm run test:grammar`.

## Workflow follow-up

- Archive the change once the review requirements are satisfied.