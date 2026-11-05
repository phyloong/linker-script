# Proposal

## Why

The published 0.1.0 listing describes "intelligent complement, grammatical cues, and other functions" while the extension only completes keywords in plain-text files. After the preceding changes the product is materially different: it owns a language, filters completions by context, documents keywords on hover, and highlights syntax. The listing, changelog, and packaging must describe that product, and the version must move to reflect a breaking change.

Without this change the work ships under a version number and description that misrepresent it, which is the fastest way to lose the users the previous changes were built for.

## What Changes

- Bump the version to `0.2.0` and record the breaking changes: the language id change, the removal of `plaintext` completion, and the raised minimum VS Code version.
- Rewrite `README.md`: what the extension does, a feature list that matches reality, a short usage example, and an explicit statement about coexistence with other linker script extensions.
- Fill `package.json` marketplace metadata: categories, keywords, and workspace capabilities.
- Verify the packaged artifact contains the grammar, language configuration, README, changelog, license, and icon, and nothing from `src/`, `out/`, or `node_modules/`.
- Add a release workflow that builds, tests, and publishes on a version tag.

## Capabilities

None. This change alters distribution metadata and documentation, not behavior. The behavior it describes is specified by the four capability changes that precede it.

### New Capabilities

- None.

### Modified Capabilities

- None.

## Impact

- `package.json`, `README.md`, `CHANGELOG.md`, `.vscodeignore`.
- Adds a CI workflow file under `.github/workflows/`.
- Depends on all other changes in this set; it is the last one applied.
