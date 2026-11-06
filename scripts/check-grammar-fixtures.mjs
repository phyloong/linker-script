#!/usr/bin/env node
/**
 * Coverage guard for the TextMate grammar fixtures.
 *
 * vscode-tmgrammar-test only checks the scopes a fixture asserts, so a token
 * that silently loses its scope would keep the suite green. This script fails
 * instead: every non-space character of every fixture source line has to sit
 * inside at least one assertion range, which is what makes a removed scope
 * break the suite. It also rejects an assertion that runs past the end of its
 * line, which is the usual symptom of a mis-aligned caret row.
 *
 * Run by `npm run test:grammar` after the inline fixtures pass.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'test/grammar';
const GRAMMAR = 'syntaxes/linker-script.tmLanguage.json';
const SCOPE = 'source.linker-script';
const COMMENT = '//';
const HEADER = new RegExp('^' + COMMENT + ' SYNTAX TEST "' + SCOPE + '"');

/**
 * A leaf scope that loses its ".ld" suffix still colors correctly, but every
 * theme override written for this grammar targets the suffix, so the loss is
 * silent. The grammar's root scopeName is the only exception; the top-level
 * "name" is a display label rather than a scope, which is why the walk starts
 * at the repository.
 */
function checkLeafScopes(node, path, problems) {
    if (Array.isArray(node)) {
        node.forEach((child, index) => checkLeafScopes(child, `${path}[${index}]`, problems));
        return;
    }
    if (node === null || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
        if (key === 'name' && typeof value === 'string' && !value.endsWith('.ld')) {
            problems.push(`${GRAMMAR}: scope "${value}" at ${path}.name does not end with ".ld"`);
        }
        checkLeafScopes(value, `${path}.${key}`, problems);
    }
}

/**
 * A dangling "#include" quietly turns a whole construct uncolored instead of
 * failing, so the grammar is checked structurally before the fixtures run.
 */
function checkGrammar() {
    const grammar = JSON.parse(readFileSync(GRAMMAR, 'utf8'));
    const problems = [];
    if (grammar.scopeName !== SCOPE) problems.push(`${GRAMMAR}: scopeName is ${grammar.scopeName}, expected ${SCOPE}`);
    const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
    const contributed = (manifest.contributes.grammars || []).find((g) => g.language === 'linker-script');
    if (!contributed) problems.push('package.json: contributes.grammars has no linker-script entry');
    else {
        if (contributed.scopeName !== SCOPE) problems.push(`package.json: grammar scopeName is ${contributed.scopeName}`);
        if (contributed.path !== './' + GRAMMAR) problems.push(`package.json: grammar path is ${contributed.path}`);
    }
    const known = new Set(Object.keys(grammar.repository));
    const seen = new Set();
    JSON.stringify(grammar, (key, value) => {
        if (value !== null && typeof value === 'object' && typeof value.include === 'string' && value.include.startsWith('#')) {
            seen.add(value.include.slice(1));
        }
        return value;
    });
    for (const name of seen) {
        if (!known.has(name)) problems.push(`${GRAMMAR}: include "#${name}" has no repository entry`);
    }
    checkLeafScopes(grammar.repository, 'repository', problems);
    for (const problem of problems) console.error(problem);
    return problems.length;
}

let failures = checkGrammar();

/** Every .ld file under test/grammar, recursively. */
function fixtures(dir) {
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) found.push(...fixtures(full));
        else if (entry.name.endsWith('.ld')) found.push(full);
    }
    return found.sort();
}

/** Ranges covered by one assertion line, following vscode-tmgrammar-test's rules. */
function rangesOf(line) {
    const body = line.slice(COMMENT.length);
    const up = /^\s*((?:(?:\^+)\s*)+)(?:\s*\w[-\w.]*)*/.exec(body);
    if (up !== null) {
        const ranges = [];
        let index = body.indexOf('^');
        while (index !== -1) {
            let end = index;
            while (body[end + 1] === '^') end++;
            ranges.push([COMMENT.length + index, COMMENT.length + end + 1]);
            index = body.indexOf('^', end + 1);
        }
        return ranges;
    }
    const left = /^(\s*)<([~]*)([-]+)/.exec(body);
    if (left !== null) {
        const from = left[2].length;
        return [[from, from + left[3].length]];
    }
    return [];
}

function isAssertion(line) {
    if (!line.startsWith(COMMENT)) return false;
    const body = line.slice(COMMENT.length);
    return /^\s*(\^|<[~]*-)/.test(body);
}

for (const file of fixtures(ROOT)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    if (!HEADER.test(lines[0])) {
        console.error(`${file}:1: missing "SYNTAX TEST \"source.linker-script\"" header`);
        failures++;
        continue;
    }
    let covered = [];
    let sourceLine = 0;
    const report = (lineNumber, column, message) => {
        console.error(`${file}:${lineNumber}:${column}: ${message}`);
        failures++;
    };
    const check = () => {
        for (let column = 0; column < sourceLine.text.length; column++) {
            if (/\s/.test(sourceLine.text[column])) continue;
            if (!covered.some(([from, to]) => from <= column && column < to)) {
                report(sourceLine.number, column + 1, `unasserted column in "${sourceLine.text.trim()}"`);
            }
        }
    };
    for (let index = 1; index < lines.length; index++) {
        const line = lines[index];
        if (isAssertion(line)) {
            if (sourceLine === 0) {
                report(index + 1, 1, 'assertion before any source line');
                continue;
            }
            for (const range of rangesOf(line)) {
                if (range[1] > sourceLine.text.length) {
                    report(index + 1, range[0] + 1, `assertion runs past the end of source line ${sourceLine.number}`);
                }
                covered.push(range);
            }
            continue;
        }
        if (sourceLine !== 0) check();
        sourceLine = { text: line, number: index + 1 };
        covered = [];
    }
    if (sourceLine !== 0) check();
}

if (failures > 0) {
    console.error(`${failures} fixture coverage failure(s)`);
    process.exit(1);
}
console.log("grammar structure ok, fixtures cover every non-space character");
