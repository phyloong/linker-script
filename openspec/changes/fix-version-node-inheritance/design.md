# Design

## Context

See `proposal.md` for the motivation. The relevant grammar shape is `#version-node` in `syntaxes/linker-script.tmLanguage.json`: a `begin` of `(?<![\w.$])([A-Za-z_][\w.$-]*)\s*(\{)?` and an `end` of `\}`. `#version-body` includes `#version-node`, comments and punctuation, and nothing else.

## Goals / Non-Goals

**Goals**

- A node reference can never open a region, so region nesting follows the braces a script actually has.
- The reference keeps its current visible colour, so the existing fixture assertions still describe the same scopes.

**Non-Goals**

- No completion for node names; they are user-defined and `keyword-completion` forbids offering them.
- No change to the extern block or to the symbol rules inside a node body.

## Decisions

### A node opens a region; a reference never does

The node rule matches the identifier only, and a lookahead decides whether a node starts:

```
"version-node": {
  "begin": "(?<![\w.$])([A-Za-z_][\w.$-]*)\s*(?=(?:/\*[^*]*\*/\s*)*\{|$)",
  "beginCaptures": { "1": { "name": "entity.name.tag.version.ld" } },
  "end": "\}",
  ...
}
```

and one inlined rule in `#version-body`, placed before the punctuation include:

```
{
  "comment": "A bare identifier at version-body level is an inheritance reference, never a node: a node always has a brace.",
  "match": "(?<![\w.$])[A-Za-z_][\w.$-]*(?=\s*(?:/\*[^*]*\*/\s*)*;)",
  "name": "entity.name.tag.version.ld"
}
```

Three properties carry the fix:

- The brace stays outside the begin match. Consuming it, as in `\s*(\{)`, makes the begin span a line break when the brace sits on the next line, and the tokenizer then drops the begin captures along with every pattern of the region, so the body loses all scopes. Leaving `{` to `#punctuation` keeps the begin on one line and still yields `punctuation.section.block.begin.ld`.
- The `$` alternative keeps a brace on the next line working: a name alone at the end of its line opens a node, and the brace on the following line is coloured by the punctuation rule, so the body keeps its scopes.
- The reference lookahead asks for `;` and tolerates comments in between, because a node declaration never ends with a semicolon while a reference always does.

Alternatives rejected:

- `\s*(\{)` with the brace consumed. This was the first attempt; it regressed `V1.0` followed by `{` on the next line for the reason above.
- Keeping the optional brace and guarding the `end` with `(?=\s*;)`. A region's `end` can match immediately after `begin` for a reference, which produces a zero-width region that depends on tokenizer details rather than on the text.
- Relying on `\s*` to span lines. TextMate applies a pattern to one line at a time, so no lookahead here can see a brace on the next line; the `$` alternative is what covers that case.

### The regression is proved by a fixture that fails first

`test/grammar/version.ld` gets a node after the inheritance reference. Before the fix, that node is consumed by the phantom region's symbol rule (`entity.name.symbol.ld`) and its `{` becomes the region end; the assertion for `entity.name.tag.version.ld` fails. After the fix it passes. This ordering matters because the original fixture could not distinguish the two grammars: the VERSION closing brace and the phantom region's closing brace carry the same scope. Two further fixtures cover the forms this rule must not break: a node whose brace sits on the next line, and a node with a comment between the name and the brace.

## Risks / Trade-offs

- [The new reference rule could colour a statement that is not a node reference] -> The rule only fires at `#version-body` level, where the only statements are node declarations and references, and only when `;` follows; symbols live inside a node body, a different pattern list.
- [A name at the end of a line with no brace anywhere opens a node] -> Accepted: that is what keeps the next-line brace working, and the region still closes at the next `}`.
- [Scope drift in the fixture guard] -> Both before and after the fix the reference is `entity.name.tag.version.ld`, so the fixture diff is additive and every non-space character of the new lines carries an assertion.
- [A reference carrying a trailing comment loses its scope] -> The lookahead tolerates a `/* ... */` between the name and the `;`, and a fixture asserts that form.

## Migration Plan

None. This is a colouring fix with no state, no manifest change and no user-visible API. Rollback is reverting the commit.

## Open Questions

None.