/**
 * Language ids this extension registers its providers for.
 *
 * Kept free of the `vscode` module so plain-Node unit tests can assert the
 * list. `linker-script` is contributed by this extension; `ld` is the
 * compatibility id used when another extension owns the file association.
 */
export const SUPPORTED_LANGUAGE_IDS: readonly string[] = ['linker-script', 'ld'];
