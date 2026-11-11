//
// Drift guard for the two keyword lists: src/keywords/registry.ts drives
// completion and hover, syntaxes/linker-script.tmLanguage.json drives colour.
// Nothing else compares them, so a keyword added to one half alone still
// passes the fixture suite and the registry suite. This file reads both and
// asserts three invariants:
//
//   - every registry keyword is coloured by a grammar pattern, either because
//     a pattern spells it out or because GENERIC_COVERAGE declares the
//     catch-all that covers it;
//   - every keyword the grammar lists in an alternation is documented, is a
//     spelling variant of a documented keyword, or is declared deliberate in
//     GRAMMAR_ONLY;
//   - no spelling inside an alternation precedes a longer spelling that starts
//     with it, so PROVIDE can never consume the start of PROVIDE_HIDDEN.
//
// What it does not prove: that a keyword is coloured in the right place. The
// fixtures under test/grammar/ and the scope-filtering tests in
// extension.test.ts cover placement; this suite only checks set membership.
//
// Shape rule for the extractor: keyword families are discovered, never listed
// here, so moving a rule between repository entries keeps the check working.
// Detection needs a non-capturing group -- (?:A|B|C), or an option group such
// as (?i:A|B) -- whose alternatives are all bare words. A new keyword family
// written in any other shape is invisible to this file, so keep keyword lists
// in that form; a group holding a "_"-terminated alternative is read as a
// lookahead hint and skipped.
//

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { KEYWORDS } from '../../keywords/registry';

const repoRoot = path.join(__dirname, '..', '..', '..');
const GRAMMAR_FILE = 'syntaxes/linker-script.tmLanguage.json';
const REGISTRY_FILE = 'src/keywords/registry.ts';

interface RulePattern {
    /** The match or begin string exactly as the JSON writes it. */
    readonly pattern: string;
    /** Every scope name the rule can produce: its own "name" plus its captures. */
    readonly scopes: readonly string[];
}

interface KeywordList {
    /** The whole match or begin string the list was found in. */
    readonly pattern: string;
    /** The alternatives, in the order the grammar tries them. */
    readonly alternatives: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readJson(fileName: string): unknown {
    return JSON.parse(fs.readFileSync(path.join(repoRoot, fileName), 'utf8')) as unknown;
}

const CAPTURE_KEYS = ['captures', 'beginCaptures', 'endCaptures'];

function scopeNames(rule: Record<string, unknown>): string[] {
    const names: string[] = [];
    const own = rule['name'];
    if (typeof own === 'string') {
        names.push(own);
    }
    for (const key of CAPTURE_KEYS) {
        const captures = rule[key];
        if (!isRecord(captures)) {
            continue;
        }
        for (const capture of Object.keys(captures)) {
            const scoped = captures[capture];
            if (isRecord(scoped) && typeof scoped['name'] === 'string') {
                names.push(scoped['name']);
            }
        }
    }
    return names;
}

// Every rule that is a match or a begin contributes one pattern string, at
// whatever depth the repository nests it, so the walk never depends on where
// a rule lives.
function collectRulePatterns(node: unknown, found: RulePattern[] = []): RulePattern[] {
    if (Array.isArray(node)) {
        for (const child of node) {
            collectRulePatterns(child, found);
        }
        return found;
    }
    if (!isRecord(node)) {
        return found;
    }
    const pattern = typeof node['match'] === 'string' ? node['match'] : node['begin'];
    if (typeof pattern === 'string') {
        found.push({ pattern: pattern, scopes: scopeNames(node) });
    }
    for (const key of Object.keys(node)) {
        if (key === 'match' || key === 'begin') {
            continue;
        }
        collectRulePatterns(node[key], found);
    }
    return found;
}

// Character classes and escape sequences describe characters a keyword never
// spells out, so remove them before searching for a literal token. Without
// this the id "A" is hidden inside [A-Za-z_] and a real gap goes unseen. The
// lookaround prefixes and the "!=" operator go too, for the same reason: their
// "!" is regex syntax, so leaving it behind would make the id "!" unfalsifiable.
function visibleText(pattern: string): string {
    return pattern
        .replace(/\(\?(?:<[=!]|[=!])/g, ' ')
        .replace(/!=/g, ' ')
        .replace(/\[(?:[^\]\\]|\\.)*\]/g, ' ')
        .replace(/\\./g, ' ');
}

function containsToken(text: string, token: string): boolean {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(?<![A-Za-z0-9_$])' + escaped + '(?![A-Za-z0-9_$])').test(text);
}

// Returns the index just past the group opening when the group is
// non-capturing -- "(?:" or an option group such as "(?i:" -- and -1 for a
// capturing group, a lookahead or a lookbehind.
function nonCapturingContentStart(pattern: string, openIndex: number): number {
    let index = openIndex + 1;
    if (pattern[index] !== '?') {
        return -1;
    }
    index += 1;
    while (index < pattern.length && /[a-zA-Z]/.test(pattern[index])) {
        index += 1;
    }
    return pattern[index] === ':' ? index + 1 : -1;
}

const BARE_WORD = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Splits a group body at its top-level "|", then accepts it as a keyword list
// only when every alternative is a bare word. A "_"-terminated alternative
// marks a lookahead hint such as (?:PT_|FILEHDR|AT), not a keyword list.
function alternativesOf(body: string): readonly string[] | undefined {
    const alternatives: string[] = [];
    let current = '';
    let depth = 0;
    let index = 0;
    while (index < body.length) {
        const character = body[index];
        if (character === '\\') {
            current += body.slice(index, index + 2);
            index += 2;
            continue;
        }
        if (character === '[') {
            let end = index + 1;
            while (end < body.length && body[end] !== ']') {
                end += body[end] === '\\' ? 2 : 1;
            }
            current += body.slice(index, end + 1);
            index = end + 1;
            continue;
        }
        if (character === '(') {
            depth += 1;
        }
        if (character === ')') {
            depth -= 1;
        }
        if (character === '|' && depth === 0) {
            alternatives.push(current);
            current = '';
            index += 1;
            continue;
        }
        current += character;
        index += 1;
    }
    alternatives.push(current);
    if (!alternatives.every((alternative) => BARE_WORD.test(alternative))) {
        return undefined;
    }
    if (alternatives.some((alternative) => alternative.endsWith('_'))) {
        return undefined;
    }
    return alternatives;
}

function keywordListsIn(pattern: string): KeywordList[] {
    const lists: KeywordList[] = [];
    const openGroups: number[] = [];
    let index = 0;
    while (index < pattern.length) {
        const character = pattern[index];
        if (character === '\\') {
            index += 2;
            continue;
        }
        if (character === '[') {
            index += 1;
            while (index < pattern.length && pattern[index] !== ']') {
                index += pattern[index] === '\\' ? 2 : 1;
            }
            index += 1;
            continue;
        }
        if (character === '(') {
            openGroups.push(nonCapturingContentStart(pattern, index));
            index += 1;
            continue;
        }
        if (character === ')') {
            const start = openGroups.pop();
            if (start !== undefined && start !== -1) {
                const alternatives = alternativesOf(pattern.slice(start, index));
                if (alternatives !== undefined) {
                    lists.push({ pattern: pattern, alternatives: alternatives });
                }
            }
            index += 1;
            continue;
        }
        index += 1;
    }
    return lists;
}

const grammarPatterns = collectRulePatterns(readJson(GRAMMAR_FILE));

const keywordLists: KeywordList[] = [];
for (const rule of grammarPatterns) {
    for (const list of keywordListsIn(rule.pattern)) {
        keywordLists.push(list);
    }
}

const registryIds = new Set(KEYWORDS.map((entry) => entry.id));

// Every alternative the extractor found, so an exception table can be checked
// for a row whose spelling no longer exists anywhere in the grammar.
const grammarTokens = new Set<string>();
for (const list of keywordLists) {
    for (const alternative of list.alternatives) {
        grammarTokens.add(alternative);
    }
}

interface GenericCoverage {
    /** Registry keyword that no grammar pattern spells out. */
    readonly id: string;
    /** Text that must still appear in a grammar pattern. */
    readonly fragment: string;
    /** Scope the pattern holding that fragment must produce. */
    readonly scope: string;
}

// Registry keywords a catch-all colours instead of a literal spelling. Each
// row states the fragment and the scope, so tightening a catch-all fails the
// suite rather than leaving a stale declaration behind.
const GENERIC_COVERAGE: readonly GenericCoverage[] = [
    // /DISCARD/ is any output-section name starting with "." or "/". That
    // expression is carried by BOTH #section-header and #overlay-section, so
    // narrowing one of the two still leaves the keyword coloured elsewhere;
    // which fixtures notice that is their business, not this suite's.
    { id: 'DISCARD', fragment: '[./][\\w.$/~+-]+', scope: 'entity.name.section.ld' },
    // Memory-region attributes: a run of letters inside the (attr) list.
    { id: 'R', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    { id: 'W', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    { id: 'X', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    { id: 'A', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    { id: 'I', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    { id: 'L', fragment: '[A-Za-z]+', scope: 'keyword.other.region-attribute.ld' },
    // Program-header types: the whole PT_ prefix-plus-name class the grammar
    // matches, so tightening that class fails here instead of passing on "PT_".
    { id: 'PT_NULL', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_LOAD', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_DYNAMIC', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_INTERP', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_NOTE', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_SHLIB', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' },
    { id: 'PT_PHDR', fragment: 'PT_[A-Z_]+', scope: 'support.type.program-header.ld' }
];

// The MEMORY region-field alternation lists short spellings beside the
// documented names, so these tokens colour the same fields the registry
// documents. Each value has to be a real registry id.
const SPELLING_VARIANTS: Readonly<Record<string, string>> = {
    org: 'ORIGIN',
    o: 'ORIGIN',
    len: 'LENGTH',
    l: 'LENGTH'
};

function variantId(token: string): string | undefined {
    return Object.keys(SPELLING_VARIANTS).indexOf(token) === -1 ? undefined : SPELLING_VARIANTS[token];
}

interface GrammarOnlyKeyword {
    readonly token: string;
    /** Why the grammar colours it while the registry does not document it. */
    readonly reason: string;
}

// Keywords the grammar colours on purpose without a registry entry.
const GRAMMAR_ONLY: readonly GrammarOnlyKeyword[] = [
    { token: 'AT', reason: 'A region marker that only exists as the AT> or AT( pointer, never as a standalone keyword.' },
    { token: 'FLAGS', reason: 'A PHDRS attribute; the registry documents program-header types, not the attribute list.' },
    { token: 'FILEHDR', reason: 'A PHDRS-only modifier, so it only appears inside a PHDRS body and is not completed.' }
];

function keywordPositions(list: KeywordList, token: string): number {
    return list.alternatives.indexOf(token);
}

suite('Grammar keyword alignment', function () {

    test('reads every match and begin string in the grammar', function () {
        // Counted straight from the file text, so a walker that stops
        // descending into a nested rule fails here instead of quietly
        // checking fewer patterns.
        const text = fs.readFileSync(path.join(repoRoot, GRAMMAR_FILE), 'utf8');
        const declared = text.match(/"(?:match|begin)":/g) || [];
        assert.ok(grammarPatterns.length > 0, GRAMMAR_FILE + ' yielded no pattern strings');
        assert.strictEqual(grammarPatterns.length, declared.length, 'the walker visits every rule of ' + GRAMMAR_FILE);
    });

    test('detects the command, expression and version keyword lists', function () {
        const commandList = keywordLists.filter((list) => keywordPositions(list, 'SORT_BY_INIT_PRIORITY') !== -1);
        assert.strictEqual(commandList.length, 1, 'the command alternation is detected');
        const expressionList = keywordLists.filter((list) => keywordPositions(list, 'ALIGN') !== -1);
        assert.strictEqual(expressionList.length, 1, 'the expression alternation is detected');
        for (const token of ['global', 'local', 'extern']) {
            const versionList = keywordLists.filter((list) => keywordPositions(list, token) !== -1);
            assert.strictEqual(versionList.length, 1, 'the version alternation lists ' + token);
        }
        const tokens: string[] = [];
        for (const list of keywordLists) {
            for (const alternative of list.alternatives) {
                tokens.push(alternative);
            }
        }
        assert.strictEqual(tokens.indexOf('PT_'), -1, 'a lookahead hint is not read as a keyword');
    });

    test('colours every registry keyword or declares its catch-all', function () {
        const visible = grammarPatterns.map((rule) => visibleText(rule.pattern));
        const declared = new Set(GENERIC_COVERAGE.map((row) => row.id));
        const uncoloured = KEYWORDS
            .map((entry) => entry.id)
            .filter((id) => !declared.has(id) && !visible.some((text) => containsToken(text, id)));
        const problems = uncoloured.map((id) =>
            id + ': in the registry but no grammar pattern colours it; add it to a grammar alternation in ' +
            GRAMMAR_FILE + ' or declare it in GENERIC_COVERAGE');
        assert.deepStrictEqual(uncoloured, [], problems.join('\n'));
    });

    test('keeps every declared catch-all present in the grammar', function () {
        const problems: string[] = [];
        for (const row of GENERIC_COVERAGE) {
            const owner = grammarPatterns.find((rule) =>
                rule.pattern.indexOf(row.fragment) !== -1 && rule.scopes.indexOf(row.scope) !== -1);
            if (owner === undefined) {
                problems.push(row.id + ': declared in GENERIC_COVERAGE but no pattern holding "' + row.fragment +
                    '" produces ' + row.scope + '; update the row or the pattern in ' + GRAMMAR_FILE);
            }
        }
        assert.deepStrictEqual(problems, [], problems.join('\n'));
    });

    test('documents every keyword the grammar lists', function () {
        const declaredOnly = new Set(GRAMMAR_ONLY.map((row) => row.token));
        const undocumented: string[] = [];
        for (const list of keywordLists) {
            for (const token of list.alternatives) {
                if (registryIds.has(token) || declaredOnly.has(token) || variantId(token) !== undefined) {
                    continue;
                }
                if (undocumented.indexOf(token) === -1) {
                    undocumented.push(token);
                }
            }
        }
        const problems = undocumented.map((token) =>
            token + ': coloured by a grammar alternation in ' + GRAMMAR_FILE + ' but absent from the registry; add it to ' +
            REGISTRY_FILE + ', SPELLING_VARIANTS or GRAMMAR_ONLY');
        assert.deepStrictEqual(undocumented, [], problems.join('\n'));
    });

    test('maps every spelling variant to a registry id', function () {
        const problems: string[] = [];
        for (const token of Object.keys(SPELLING_VARIANTS)) {
            const canonical = SPELLING_VARIANTS[token];
            if (!registryIds.has(canonical)) {
                problems.push(token + ' -> ' + canonical + ': SPELLING_VARIANTS must map to a registry id in ' + REGISTRY_FILE);
            }
            if (!grammarTokens.has(token)) {
                problems.push(token + ': declared in SPELLING_VARIANTS but no grammar alternation in ' + GRAMMAR_FILE +
                    ' lists it; drop the row or restore the spelling in ' + GRAMMAR_FILE);
            }
        }
        assert.deepStrictEqual(problems, [], problems.join('\n'));
    });

    test('declares catch-all ids that the registry still holds', function () {
        const problems: string[] = [];
        const seen = new Set<string>();
        for (const row of GENERIC_COVERAGE) {
            if (!registryIds.has(row.id)) {
                problems.push(row.id + ': declared in GENERIC_COVERAGE but not a registry id in ' + REGISTRY_FILE + '; drop the row or restore the keyword');
            }
            if (seen.has(row.id)) {
                problems.push(row.id + ': declared twice in GENERIC_COVERAGE');
            }
            seen.add(row.id);
        }
        assert.deepStrictEqual(problems, [], problems.join('\n'));
    });

    test('keeps grammar-only keywords out of the registry and explains each', function () {
        const problems: string[] = [];
        for (const row of GRAMMAR_ONLY) {
            if (registryIds.has(row.token)) {
                problems.push(row.token + ': declared in GRAMMAR_ONLY but documented in ' + REGISTRY_FILE + '; drop the row');
            }
            if (row.reason.trim().length === 0) {
                problems.push(row.token + ': GRAMMAR_ONLY needs a reason saying why the grammar colours it');
            }
            if (!grammarTokens.has(row.token)) {
                problems.push(row.token + ': declared in GRAMMAR_ONLY but no grammar alternation in ' + GRAMMAR_FILE +
                    ' lists it; drop the row or restore the spelling in ' + GRAMMAR_FILE);
            }
        }
        assert.deepStrictEqual(problems, [], problems.join('\n'));
    });

    test('lists PROVIDE_HIDDEN before PROVIDE', function () {
        const commandList = keywordLists.filter((list) => keywordPositions(list, 'PROVIDE_HIDDEN') !== -1);
        assert.strictEqual(commandList.length, 1, 'the command alternation lists PROVIDE_HIDDEN');
        const hidden = keywordPositions(commandList[0], 'PROVIDE_HIDDEN');
        const plain = keywordPositions(commandList[0], 'PROVIDE');
        assert.ok(plain !== -1, 'the command alternation lists PROVIDE');
        assert.ok(hidden < plain, 'PROVIDE_HIDDEN must precede PROVIDE in ' + GRAMMAR_FILE);
    });

    test('no alternation lists a spelling before a longer spelling it prefixes', function () {
        const problems: string[] = [];
        for (const list of keywordLists) {
            for (let earlier = 0; earlier < list.alternatives.length; earlier += 1) {
                for (let later = earlier + 1; later < list.alternatives.length; later += 1) {
                    const short = list.alternatives[earlier];
                    const long = list.alternatives[later];
                    if (long !== short && long.indexOf(short) === 0) {
                        problems.push(short + ' is listed before ' + long + ': a shorter spelling is never a prefix of a ' +
                            'longer one later in the same alternation, so list ' + long + ' first in ' + GRAMMAR_FILE);
                    }
                }
            }
        }
        assert.deepStrictEqual(problems, [], problems.join('\n'));
    });
});
