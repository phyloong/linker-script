# Proposal

## Why

The extension advertises "grammatical cues" but provides none. A user who does not remember whether `LOADADDR` takes a section or an expression has to leave the editor, and the keyword registry that already exists for completion carries no explanation of what each keyword does.

Hover documentation is the cheapest way to turn the registry into something a user benefits from while reading an unfamiliar script, not just while typing a new one.

## What Changes

- Register a hover provider for `linker-script` and `ld`.
- Render, for any registered keyword, a signature line, a one-sentence summary, and a short example.
- Author English documentation for every registry entry, written originally rather than copied from the GNU ld manual.
- Return no hover for words the registry does not know.

## Capabilities

### New Capabilities

- `keyword-documentation`: what a user sees when hovering a linker script keyword, and the provenance rules for that text.

### Modified Capabilities

- None.

## Impact

- New `src/hover/` provider and documentation content in the registry.
- Depends on `improve-keyword-completion` for the registry shape and on `add-linker-script-language` for the language ids.
- No new runtime dependencies.
