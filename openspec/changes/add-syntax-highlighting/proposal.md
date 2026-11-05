# Proposal

## Why

A linker script currently renders as unformatted text. Commands, numbers, section names, and comments are visually identical, so structure is hard to follow and mistakes are hard to see. A competing extension already ships highlighting for `.ld` and `.lds`; without a grammar of its own, this extension looks featureless on the marketplace and shows nothing for users who install it alone.

## What Changes

- Register a TextMate grammar for `linker-script` with root scope `source.linker-script`.
- Cover comments, numbers with `K`/`M` suffixes and hex/octal forms, strings, top-level commands, block keywords, output section headers, input section patterns including exclusion with `!`, location counters, `>region` and `AT>` markers, `/DISCARD/`, memory region attributes, program header types and flags, and `VERSION` block bodies.
- Keep leaf scope names ending in `.ld` so generic theme rules that already target linker script tokens continue to apply.
- Add grammar snapshot tests so a regex change cannot silently break a block.

## Capabilities

### New Capabilities

- `syntax-highlighting`: which linker script constructs receive a token scope, and how the grammar is verified.

### Modified Capabilities

- None.

## Impact

- New `syntaxes/linker-script.tmLanguage.json` and its fixture files.
- `package.json` gains a `contributes.grammars` entry; `.vscodeignore` must not exclude `syntaxes/`.
- Depends on `add-linker-script-language` for the language id and on `migrate-extension-toolchain` for the test runner.
