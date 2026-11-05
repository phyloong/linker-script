# Design

## Context

See proposal.md - Why. Current state:

- `package.json` version is `0.1.0`; `README.md` is five lines; `CHANGELOG.md` has one entry.
- `publisher` is `amapleaf`, so the published identifier `amapleaf.linker-script` is fixed.
- The extension icon is `img/Script.png`; it is not excluded by `.vscodeignore`.
- The repository has no CI configuration.

## Goals / Non-Goals

**Goals:**

- A listing whose claims match the shipped behavior, with one screenshot per capability.
- A release that can be reproduced from a clean checkout by one command.
- Publishing credentials that are not a long-lived token stored in a developer machine.

**Non-Goals:**

- Renaming the extension or changing the publisher.
- Localized listings or a documentation site.
- Publishing to Open VSX as part of the same workflow (a separate, later decision).

## Decisions

### 0.2.0, not 1.0.0

The breaking changes are real but the extension is still a small, single-purpose tool. `0.2.0` signals "new shape, still pre-1.0" and leaves room for the grammar and hover content to settle before a 1.0 claim.

### README structure: behavior first, coexistence second

Sections in order: one-line description, feature list, a complete short example script, compatibility statement, requirements, and known limitations. The coexistence statement names the competing extension and explains the file-association rule, because a user who installs both will otherwise file a bug that this repository cannot fix.

### Trusted publishing over a stored token

`@vscode/vsce` 4.x supports publishing through an OIDC exchange with the marketplace. The workflow uses it so no PAT lives in repository secrets. Fallback: a scoped PAT in secrets if trusted publishing is unavailable for this publisher.

### One command, verified artifact

The release workflow runs the same commands a maintainer runs locally: type check, bundle, unit tests, extension-host tests, then `vsce package`. The artifact is inspected before publishing, so packaging errors fail the job rather than reaching users.

## Risks / Trade-offs

- [Breaking changes reach users who never read the changelog] -> The changelog leads with the breaking section and the README repeats the minimum version.
- [Screenshots go stale] -> Screenshots are captured from the released build as the last step, not months earlier.
- [The publish job cannot be tested without publishing] -> Use `--dry-run` packaging in CI on every push and publish only on tags.
- [Two extensions fight over `.lds`] -> Documented explicitly; this change does not attempt to resolve the conflict in code.

## Migration Plan

1. Prepare metadata and documentation against a locally built artifact.
2. Run the full verification chain and inspect the packaged file list.
3. Tag the release; the workflow publishes.
4. If the listing is wrong, unpublish or publish a corrected patch version; the previous version can be reinstated from the marketplace.

## Open Questions

- Whether to publish to Open VSX. Deferred: it needs a separate publisher account and does not block the marketplace release.
