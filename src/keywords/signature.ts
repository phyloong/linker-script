/**
 * Hover signatures, derived from the completion snippet.
 *
 * Free of the 'vscode' module so plain-Node tests cover the derivation: a
 * second hand-written signature field would be one more thing to forget when a
 * snippet changes.
 */

import { KeywordEntry } from './registry';

// ${1:default} keeps the default; a bare ${1} disappears.
const PLACEHOLDER_WITH_DEFAULT = /\$\{\d+:([^}]*)\}/g;
const BARE_PLACEHOLDER = /\$\{\d+\}/g;

function collapse(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Render the signature of a snippet.
 *
 * Placeholders are replaced by their defaults, and a brace body that spans
 * lines collapses to `{ ... }`, so `SECTIONS {\n\t\n}` reads as
 * `SECTIONS { ... }` and `ALIGN(${1:expression})` reads as
 * `ALIGN(expression)`.
 */
export function deriveSignature(snippet: string): string {
    const filled = snippet
        .replace(PLACEHOLDER_WITH_DEFAULT, (_match, value: string) => value)
        .replace(BARE_PLACEHOLDER, '');

    const open = filled.indexOf('{');
    const close = filled.lastIndexOf('}');
    if (open !== -1 && close > open && filled.slice(open + 1, close).indexOf('\n') !== -1) {
        return collapse(filled.slice(0, open + 1) + ' ... ' + filled.slice(close));
    }
    return collapse(filled);
}

/** The signature to show: the entry's override when it has one, else derived. */
export function signatureOf(entry: Pick<KeywordEntry, 'snippet' | 'signature'>): string {
    return entry.signature === undefined ? deriveSignature(entry.snippet) : entry.signature;
}
