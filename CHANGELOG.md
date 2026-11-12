# Change Log

## 0.3.0

### Added

- Completion and hover for the `PT_TLS`, `PT_GNU_STACK`, `PT_GNU_RELRO` and `PT_GNU_EH_FRAME` program header types, the `FILEHDR` and `FLAGS` program header modifiers, the `EXCLUDE_FILE` and `SORT_NONE` input section filters, and the `DATA_SEGMENT_ALIGN`, `DATA_SEGMENT_RELRO_END`, `CONSTANT` and `SEGMENT_START` functions, bringing the registry to 84 keywords.

### Changed

- `ASSERT`, `PROVIDE` and `PROVIDE_HIDDEN` are now offered inside an output section body, where `ld` accepts them as statements.

### Fixed

- A version node inheritance reference no longer opens a region of its own, so a node declared after `V2.0 { } V1.0;` keeps its version tag scope.

## 0.2.1

### Added

- Completion and hover inside `VERSION` blocks for the version-script commands `global`, `local` and `extern`, which bring the registry to 72 keywords.
- Grammar coverage for `extern "C++" { ... }` language blocks and for version node inheritance, with fixture assertions over every covered token.

### Changed

- The syntax-highlighting requirement now names the inline scope assertions in the `.ld` fixtures instead of calling them snapshot tests.

## 0.2.0

### Breaking Changes

- **New language id.** Linker scripts are now the dedicated language `linker-script` (contributed by this extension, associated with `.lds` and `.ld`), instead of being edited as plain text. Any setting or snippet override that was scoped to `plaintext` no longer applies to these files; scope it to `linker-script` or `ld` instead.
- **Plain-text completion removed.** Completion and hover are no longer registered for the `plaintext` language id. A document that is not `linker-script` or `ld` receives no items and no tooltips.
- **Minimum VS Code version raised from 1.30.0 to 1.74.0.** `engines.vscode` is now `^1.74.0`; older editors mark the extension as incompatible rather than installing it.

### Added

- Context-filtered completion for 69 keywords, with scope scanning over `SECTIONS`, output section bodies, `MEMORY`, `PHDRS`, `VERSION` and `OVERLAY`, and a full-keyword fallback when the context is uncertain.
- Hover documentation for every keyword: derived signature, one-sentence summary, and a usage example.
- A TextMate grammar with scope root `source.linker-script`, plus grammar fixtures for every construct family and the malformed cases.
- A language contribution with `/* */` comments, bracket pairs, folding markers, and a word pattern that keeps `SORT_BY_NAME` and `.text.foo` whole.
- Compatibility registration for the `ld` language id, so completion and hover still work when another extension owns the `.lds`/`.ld` association.

### Changed

- Marketplace metadata rewritten to describe the shipped behavior: new description, the `Programming Languages` and `Snippets` categories, keywords, and honest workspace capability declarations (no workspace writes, so untrusted and virtual workspaces are supported).
- Packaging now ships the esbuild bundle `dist/extension.js` (the previous `out/` TypeScript build is gone).

## 0.1.0

- Complete the auto-fill feature for basic keywords.