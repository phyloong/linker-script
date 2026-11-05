/**
 * Scope scanner: a single pass over the text before the cursor that reports
 * which block the cursor sits in, so completion can narrow its item list.
 *
 * This is deliberately not a parser. It tracks three lexical states (normal,
 * block comment, string) and a stack of scopes pushed by braces. Every
 * ambiguity resolves to "uncertain", which the provider turns into the full
 * keyword list rather than a guess.
 *
 * The module imports nothing from 'vscode' so plain-Node tests cover it.
 */

import { KeywordScope } from './registry';

/** Why the scanner could not determine a confident scope. */
export type ScanUncertainty = 'stray-closing-brace' | 'unterminated-comment' | 'include';

export interface ScanResult {
    /** Innermost scope at the cursor; 'top' when the brace stack is empty. */
    readonly scope: KeywordScope;
    /** Scope stack from outermost to innermost; empty at top level. */
    readonly path: readonly KeywordScope[];
    /** True when filtering must be skipped and every keyword offered. */
    readonly uncertain: boolean;
    /** Which condition made the result uncertain, for tests and diagnostics. */
    readonly reason: ScanUncertainty | null;
    /** True when the cursor sits inside a comment or a string literal. */
    readonly inCommentOrString: boolean;
}

/** Block keywords that open a scope when the matching brace is found. */
const BLOCK_KEYWORDS: { readonly [word: string]: KeywordScope } = {
    SECTIONS: 'sections',
    MEMORY: 'memory',
    PHDRS: 'phdrs',
    VERSION: 'version',
    OVERLAY: 'overlay'
};

function isIdentifierStart(character: string): boolean {
    return (character >= 'A' && character <= 'Z')
        || (character >= 'a' && character <= 'z')
        || character === '_';
}

function isIdentifierPart(character: string): boolean {
    return isIdentifierStart(character) || (character >= '0' && character <= '9');
}

/**
 * Scan text for the scope enclosing cursorOffset.
 *
 * Only the prefix [0, cursorOffset) drives the state machine; the suffix is
 * consulted once, to tell a comment that closes after the cursor (the user is
 * inside a comment) from one that never closes (the file is broken, so the
 * context is unknown).
 */
export function scanScopes(text: string, cursorOffset: number = text.length): ScanResult {
    const limit = Math.max(0, Math.min(cursorOffset, text.length));
    const path: KeywordScope[] = [];
    let pending: KeywordScope | null = null;
    let inComment = false;
    let inString = false;
    let reason: ScanUncertainty | null = null;

    let index = 0;
    while (index < limit) {
        const character = text[index];

        if (inComment) {
            if (character === '*' && text[index + 1] === '/') {
                inComment = false;
                index += 2;
                continue;
            }
            index += 1;
            continue;
        }

        if (inString) {
            if (character === '\\') {
                index += 2;
                continue;
            }
            if (character === '"') {
                inString = false;
            }
            index += 1;
            continue;
        }

        if (character === '/' && text[index + 1] === '*') {
            inComment = true;
            index += 2;
            continue;
        }

        if (character === '"') {
            inString = true;
            index += 1;
            continue;
        }

        if (character === '{') {
            if (pending !== null) {
                path.push(pending);
                pending = null;
            } else {
                const enclosing: KeywordScope = path.length === 0 ? 'top' : path[path.length - 1];
                // Inside SECTIONS (or OVERLAY) an unlabelled brace opens an
                // output section body; elsewhere it repeats the enclosing block.
                const opensSectionBody = enclosing === 'sections' || enclosing === 'overlay';
                path.push(opensSectionBody ? 'section-body' : enclosing);
            }
            index += 1;
            continue;
        }

        if (character === '}') {
            if (path.length === 0) {
                // A closing brace with nothing to close means the structure is
                // broken further up; keep scanning but never trust the result.
                reason = reason === null ? 'stray-closing-brace' : reason;
            } else {
                path.pop();
            }
            index += 1;
            continue;
        }

        if (character === ';') {
            pending = null;
            index += 1;
            continue;
        }

        if (isIdentifierStart(character)) {
            let end = index + 1;
            while (end < limit && isIdentifierPart(text[end])) {
                end += 1;
            }
            const word = text.slice(index, end);
            if (word === 'INCLUDE') {
                // The included file is unknown, so the enclosing scope cannot
                // be trusted from this point on.
                reason = reason === null ? 'include' : reason;
            } else if (Object.prototype.hasOwnProperty.call(BLOCK_KEYWORDS, word)) {
                pending = BLOCK_KEYWORDS[word];
            }
            index = end;
            continue;
        }

        index += 1;
    }

    let inCommentOrString = false;
    if (inComment) {
        if (text.indexOf('*/', limit) !== -1) {
            inCommentOrString = true;
        } else {
            reason = reason === null ? 'unterminated-comment' : reason;
        }
    }
    if (inString) {
        inCommentOrString = true;
    }

    return {
        scope: path.length === 0 ? 'top' : path[path.length - 1],
        path,
        uncertain: reason !== null,
        reason,
        inCommentOrString
    };
}

/** Human-readable form of a scope path: 'sections > section-body'. */
export function formatPath(path: readonly KeywordScope[]): string {
    return path.length === 0 ? 'top' : path.join(' > ');
}
