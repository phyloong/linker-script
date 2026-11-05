# Design

## Context

See proposal.md - Why. Relevant constraints:

- `src/extension.ts` currently returns one disposable from `vscode.languages.registerCompletionItemProvider('plaintext', new CompletionProvider)`.
- `package.json` has no `contributes` block at all; the previous `contributes.commands` entry was removed in the last commit.
- The host extension for this task may be `migrate-extension-toolchain`, which changes `main` to `dist/extension.js` and raises the engine floor.

## Goals / Non-Goals

**Goals:**

- One canonical language id, with a compatibility path for a second id that this extension does not own.
- Zero features on non-linker documents.
- Activation independent of workspace shape.

**Non-Goals:**

- Syntax highlighting (separate change) and hover content (separate change).
- Language server, definition providers, or diagnostics.
- Re-claiming `.ld` from other extensions that already declare it.

## Decisions

### Language id `linker-script`, scope-free at this stage

The id is descriptive and unlikely to collide. The grammar scope is decided in the highlighting change, so this change does not add a `grammars` entry.

Alternative rejected: reuse `ld` as the id. Two extensions contributing the same id gives the file association to whichever sorts last, and the loser's grammar and providers become unpredictable.

### Register providers per language id, over a shared implementation

`activate` registers the same provider instances for `linker-script` and `ld` in a loop, and `activationEvents` lists `onLanguage:ld` explicitly because `ld` is not contributed by this extension and therefore receives no implicit activation event.

Reasoning: VS Code resolves a file extension to a language id by processing extensions in publisher order and letting the last match win, without prompting the user. Since `amapleaf.linker-script` sorts before `squarewave.linker-script-syntax`, the other extension wins `.lds` and `.ld` when both are installed. Registering on `ld` keeps this extension functional in that state instead of silently dead.

### `workspaceContains` is removed entirely

Activation is expressed only through language events. Keeping `workspaceContains:**/*.lds` would preserve the current defect where a single-file open never activates.

### Word pattern

Linker scripts use dotted section names (`.text.foo`) and underscored commands (`SORT_BY_NAME`). The configuration sets `wordPattern` to a pattern covering letters, digits, underscore, dot, and leading dots, so hover and selection operate on whole identifiers.

## Risks / Trade-offs

- [Removing `plaintext` breaks a workflow someone relies on] -> Accepted as an explicit breaking change; recorded in the changelog of the release change.
- [The competing extension changes its language id, and the compatibility registration becomes dead weight] -> It costs one extra registration and one activation event; the cost of not having it is silent failure for every user with both extensions installed.
- [Claiming `.ld` increases association conflicts] -> Accepted: without it, the dominant file name in embedded projects never activates this extension.
- [`^1.74.0` excludes older editors] -> Accepted and recorded; the floor is required for implicit activation events.

## Migration Plan

1. Add the language contribution and configuration file.
2. Change provider registration to iterate over the supported language ids.
3. Replace `activationEvents` with `onLanguage:ld` only.
4. Verify with a manual matrix: `.lds` alone, `.ld` alone, plain text file, and with the competing extension installed.
