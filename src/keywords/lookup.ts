/**
 * Keyword lookup for hover: an exact id map plus the word pattern that decides
 * which slice of the document is a candidate.
 *
 * Both stay free of the 'vscode' module so plain-Node tests can prove the map
 * only answers exact ids and that the pattern matches whole tokens.
 */

import { KEYWORDS, KeywordEntry } from './registry';

const BY_ID: ReadonlyMap<string, KeywordEntry> = new Map(
    KEYWORDS.map((entry): [string, KeywordEntry] => [entry.id, entry])
);

/** The entry registered under this exact id, or undefined. */
export function keywordById(id: string): KeywordEntry | undefined {
    return BY_ID.get(id);
}

function escapeForRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longest ids first so PROVIDE_HIDDEN is not shadowed by PROVIDE and
// SORT_BY_NAME is not shadowed by SORT.
const ID_ALTERNATION = KEYWORDS
    .map((entry) => entry.id)
    // '!' is a prefix operator: in '(!rx)' the attribute letters follow it
    // directly, so it gets its own branch below instead of a word boundary.
    // That branch excludes '!=', which is a comparison rather than the keyword.
    .filter((id) => id !== '!')
    .sort((left, right) => right.length - left.length || left.localeCompare(right))
    .map(escapeForRegExp)
    .join('|');

/**
 * A fresh global regex matching one whole registry id, never a substring of a
 * longer identifier. Callers must ask for a new one per lookup: the global
 * flag makes the expression stateful, and VS Code requires it for
 * TextDocument.getWordRangeAtPosition.
 */
export function keywordWordPattern(): RegExp {
    return new RegExp('(?<![A-Za-z0-9_$])(?:' + ID_ALTERNATION + ')(?![A-Za-z0-9_$])|!(?!=)', 'g');
}
