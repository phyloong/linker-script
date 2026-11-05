# Proposal

## Why

Every keyword is constructed inline in `provideCompletionItems`, and the whole array is returned for any position. The shape has three costs: adding a keyword means editing one 200-line method and a parallel return array; the same knowledge cannot be reused for hover or filtering; and several snippets are wrong today (`VERSION` embeds a stray newline in a placeholder, `PROVIDE` spells `experssion`, `SORT` and `GROUP` only offer one form).

Because the list is position-independent, a user typing inside an output section body is offered `SECTIONS`, `MEMORY`, and `PHDRS`, which cannot appear there.

## What Changes

- Introduce a keyword registry as the single source of truth for label, kind, snippet, documentation, and permitted contexts.
- Render completion items from the registry instead of hand-built locals.
- Filter items by the block the cursor is inside: top level, `SECTIONS`, output section body, `MEMORY`, `PHDRS`, `VERSION`, `OVERLAY`.
- Fall back to the unfiltered list whenever the enclosing context cannot be determined.
- Correct the faulty snippets and fill coverage gaps (`PROVIDE_HIDDEN`, `INSERT`, `REGION_ALIAS`, `LD_FEATURE`, `SORT_BY_*`, variadic `GROUP`/`INPUT`).
- Keep the provider registered for both `linker-script` and `ld`.

## Capabilities

### New Capabilities

- `keyword-completion`: which linker script keywords are offered, in which syntactic context, and how the snippet for each one is inserted.

### Modified Capabilities

- None.

## Impact

- New `src/keywords/` data module and a scope scanner module.
- `src/Completion.ts` becomes a thin renderer over the registry.
- Depends on `add-linker-script-language` for the language ids and `migrate-extension-toolchain` for the test layout.
