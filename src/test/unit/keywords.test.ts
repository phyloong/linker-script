//
// Pure-Node tests for the keyword registry: coverage, invariants, scope
// filtering, and the exact snippet strings the spec calls out.
//

import * as assert from 'assert';
import {
    EXAMPLE_MAX_LENGTH,
    EXAMPLE_MAX_LINES,
    KEYWORDS,
    KeywordEntry,
    KeywordScope,
    SUMMARY_MAX_LENGTH,
    keywordsForScope
} from '../../keywords/registry';

const ids = KEYWORDS.map((entry) => entry.id);
const byId = new Map<string, KeywordEntry>(KEYWORDS.map((entry) => [entry.id, entry] as [string, KeywordEntry]));

function entry(id: string): KeywordEntry {
    const found = byId.get(id);
    if (found === undefined) {
        throw new Error('missing registry entry: ' + id);
    }
    return found;
}

function labels(scope: KeywordScope): string[] {
    return keywordsForScope(scope).map((item) => item.id);
}

function occurrences(text: string, needle: string): number {
    return text.split(needle).length - 1;
}

// The keyword set as it existed before the registry was introduced; every one
// of these must survive the migration.
const PREVIOUS_IDS = [
    'SIZEOF_HEADERS', 'SECTIONS', 'ENTRY', 'INCLUDE', 'INPUT', 'GROUP', 'OUTPUT',
    'SEARCH_DIR', 'STARTUP', 'OUTPUT_FORMAT', 'TARGET', 'ASSERT', 'EXTERN',
    'FORCE_COMMON_ALLOCATION', 'NOCROSSREFS', 'OUTPUT_ARCH', 'PROVIDE', 'BYTE',
    'SHORT', 'LONG', 'QUAD', 'FILL', 'CREATE_OBJECT_SYMBOLS', 'CONSTRUCTORS',
    'SORT', 'DISCARD', 'NOLOAD', 'DSECT', 'COPY', 'INFO', 'OVERLAY', 'MEMORY',
    'PHDRS', 'PT_NULL', 'PT_LOAD', 'PT_DYNAMIC', 'PT_INTERP', 'PT_NOTE',
    'PT_SHLIB', 'PT_PHDR', 'VERSION', 'ABSOLUTE', 'ADDR', 'ALIGN', 'BLOCK',
    'DEFINED', 'LOADADDR', 'MAX', 'MIN', 'NEXT', 'SIZEOF'
];

// Entries added since the pre-registry baseline, plus ORIGIN/LENGTH, which the
// MEMORY scenario requires and the old table never had.
const ADDED_IDS = [
    'PROVIDE_HIDDEN', 'INSERT', 'REGION_ALIAS', 'LD_FEATURE', 'SORT_BY_NAME',
    'SORT_BY_ALIGNMENT', 'SORT_BY_INIT_PRIORITY', 'SQUAD', 'KEEP',
    'PT_TLS', 'PT_GNU_STACK', 'PT_GNU_RELRO', 'PT_GNU_EH_FRAME',
    'FILEHDR', 'FLAGS', 'EXCLUDE_FILE', 'SORT_NONE',
    'DATA_SEGMENT_ALIGN', 'DATA_SEGMENT_RELRO_END', 'CONSTANT', 'SEGMENT_START'
];
const REGION_FIELD_IDS = ['ORIGIN', 'LENGTH'];

// The optional (attr) list of a MEMORY region: every documented attribute.
const REGION_ATTRIBUTE_IDS = ['R', 'W', 'X', 'A', 'I', 'L', '!'];

// The version-script commands, spelled in lower case as the syntax writes them.
const VERSION_IDS = ['global', 'local', 'extern'];

const KINDS = ['block', 'command', 'function', 'field', 'keyword'];
const SCOPES = ['top', 'sections', 'section-body', 'memory', 'phdrs', 'version', 'overlay'];

suite('Keyword registry', function () {

    test('keeps every keyword that existed before the registry', function () {
        const missing = PREVIOUS_IDS.filter((id) => !byId.has(id));
        assert.deepStrictEqual(missing, [], 'no keyword was silently dropped');
        assert.strictEqual(PREVIOUS_IDS.length, 51);
    });

    test('adds each missing keyword exactly once', function () {
        for (const id of ADDED_IDS.concat(REGION_FIELD_IDS, REGION_ATTRIBUTE_IDS, VERSION_IDS)) {
            assert.strictEqual(ids.filter((candidate) => candidate === id).length, 1, id + ' resolves to exactly one entry');
        }
        assert.strictEqual(ids.length, 51 + ADDED_IDS.length + REGION_FIELD_IDS.length + REGION_ATTRIBUTE_IDS.length + VERSION_IDS.length);
        assert.strictEqual(KEYWORDS.length, 84);
    });

    test('has no duplicate ids', function () {
        assert.strictEqual(new Set(ids).size, ids.length);
    });

    // Invariant sweep: dropping a field from any entry must fail here.
    test('every entry has a non-empty snippet, a known kind, and at least one scope', function () {
        for (const item of KEYWORDS) {
            assert.ok(item.id.length > 0, 'entry has an id');
            assert.strictEqual(typeof item.snippet, 'string', item.id + ' has a string snippet');
            assert.ok(item.snippet.trim().length > 0, item.id + ' has a non-empty snippet');
            assert.ok(KINDS.indexOf(item.kind) !== -1, item.id + ' has a known kind');
            assert.ok(item.scopes.length > 0, item.id + ' lists at least one scope');
            for (const scope of item.scopes) {
                assert.ok(SCOPES.indexOf(scope) !== -1, item.id + ' has a known scope: ' + scope);
            }
            assert.ok(item.summary.trim().length > 0, item.id + ' carries a summary');
            assert.ok(item.example.trim().length > 0, item.id + ' carries an example');
        }
    });

    // The hover content is asserted here, next to the data it constrains, so a
    // new entry cannot land without the two prose fields.
    test('every entry has a one-sentence summary within the length cap', function () {
        for (const item of KEYWORDS) {
            const summary = item.summary;
            assert.ok(summary.length <= SUMMARY_MAX_LENGTH,
                item.id + ' summary is at most ' + SUMMARY_MAX_LENGTH + ' characters');
            assert.strictEqual(summary.trim(), summary, item.id + ' summary has no outer spaces');
            assert.strictEqual(summary.slice(-1), '.', item.id + ' summary ends with a full stop');
            assert.strictEqual(summary.indexOf('. '), -1, item.id + ' summary holds a single sentence');
        }
    });

    test('every entry has a short example within the length and line caps', function () {
        for (const item of KEYWORDS) {
            assert.ok(item.example.trim().length > 0, item.id + ' has a non-empty example');
            assert.strictEqual(item.example.trim(), item.example, item.id + ' example has no outer spaces');
            assert.ok(item.example.length <= EXAMPLE_MAX_LENGTH,
                item.id + ' example is at most ' + EXAMPLE_MAX_LENGTH + ' characters');
            assert.ok(item.example.split('\n').length <= EXAMPLE_MAX_LINES,
                item.id + ' example is at most ' + EXAMPLE_MAX_LINES + ' lines');
            assert.strictEqual(item.example.indexOf('\t'), -1, item.id + ' example uses spaces, not tabs');
        }
    });

    test('every entry is offered by completion in at least one scope', function () {
        const offered = new Set<string>();
        for (const scope of SCOPES as KeywordScope[]) {
            for (const id of labels(scope)) {
                offered.add(id);
            }
        }
        const missing = ids.filter((id) => !offered.has(id));
        assert.deepStrictEqual(missing, [], 'hover can only show entries completion also offers');
    });

    // The placement vocabulary agreed for registry prose: one fixed phrase per
    // scope, so the rule below can be checked on every multi-scope entry rather
    // than on a hand-picked few.
    test('multi-scope summaries name every placement in their scope list', function () {
        const phrases: { [scope in KeywordScope]: string } = {
            top: 'top level',
            sections: 'SECTIONS',
            'section-body': 'output section',
            memory: 'MEMORY',
            phdrs: 'PHDRS',
            version: 'VERSION',
            overlay: 'overlay'
        };
        const multiScope = KEYWORDS.filter((item) => item.scopes.length > 1);
        assert.ok(multiScope.length > 1, 'the registry holds several multi-scope entries');
        for (const item of multiScope) {
            for (const scope of item.scopes) {
                assert.ok(item.summary.indexOf(phrases[scope]) !== -1,
                    item.id + ' summary names its ' + scope + ' placement');
            }
        }
    });

    test('top level offers the commands the spec names', function () {
        const top = labels('top');
        for (const id of ['ENTRY', 'OUTPUT_FORMAT', 'OUTPUT_ARCH', 'INPUT', 'GROUP',
            'SEARCH_DIR', 'STARTUP', 'ASSERT', 'EXTERN', 'INCLUDE', 'PROVIDE',
            'PROVIDE_HIDDEN', 'INSERT']) {
            assert.ok(top.indexOf(id) !== -1, id + ' is offered at top level');
        }
        assert.strictEqual(top.indexOf('BYTE'), -1, 'data commands are not offered at top level');
    });

    test('an output section body offers data commands and the symbol commands', function () {
        const body = labels('section-body');
        for (const id of ['BYTE', 'SHORT', 'LONG', 'QUAD', 'SQUAD', 'FILL', 'ALIGN',
            'PROVIDE', 'PROVIDE_HIDDEN', 'ASSERT']) {
            assert.ok(body.indexOf(id) !== -1, id + ' is offered in a section body');
        }
    });

    test('an output section body offers the input section filters', function () {
        const body = labels('section-body');
        for (const id of ['EXCLUDE_FILE', 'SORT_NONE']) {
            assert.ok(body.indexOf(id) !== -1, id + ' is offered in a section body');
        }
        assert.strictEqual(entry('EXCLUDE_FILE').snippet, 'EXCLUDE_FILE(${1:file.o})');
        assert.strictEqual(entry('SORT_NONE').snippet, 'SORT_NONE(${1:.text*})');
    });

    test('PHDRS offers the header types and the two modifiers', function () {
        const phdrs = labels('phdrs');
        for (const id of ['PT_LOAD', 'PT_TLS', 'PT_GNU_STACK', 'PT_GNU_RELRO', 'PT_GNU_EH_FRAME',
            'FILEHDR', 'FLAGS']) {
            assert.ok(phdrs.indexOf(id) !== -1, id + ' is offered inside PHDRS');
        }
        for (const id of ['SECTIONS', 'MEMORY', 'BYTE', 'KEEP']) {
            assert.strictEqual(phdrs.indexOf(id), -1, id + ' is not offered inside PHDRS');
        }
        assert.strictEqual(entry('FLAGS').snippet, 'FLAGS(${1:flags})');
    });

    // The scope list is asserted whole: sharing EXPRESSION_SCOPES makes a
    // missing or extra placement invisible to a presence check.
    test('builtin functions are offered only where ld accepts them', function () {
        assert.deepStrictEqual(entry('DATA_SEGMENT_ALIGN').scopes, ['sections']);
        assert.deepStrictEqual(entry('DATA_SEGMENT_RELRO_END').scopes, ['sections']);
        assert.deepStrictEqual(entry('CONSTANT').scopes, ['top', 'sections', 'section-body', 'overlay']);
        assert.deepStrictEqual(entry('SEGMENT_START').scopes, ['top', 'sections', 'section-body', 'overlay']);
        assert.strictEqual(entry('DATA_SEGMENT_ALIGN').snippet, 'DATA_SEGMENT_ALIGN(${1:maxpagesize}, ${2:commonpagesize})');
    });

    test('the output section level offers section syntax but no data commands', function () {
        const sections = labels('sections');
        for (const id of ['KEEP', 'SORT', 'DISCARD', 'PROVIDE', 'ASSERT']) {
            assert.ok(sections.indexOf(id) !== -1, id + ' is offered directly inside SECTIONS');
        }
        for (const id of ['BYTE', 'SHORT', 'LONG', 'QUAD', 'SQUAD', 'FILL']) {
            assert.strictEqual(sections.indexOf(id), -1, id + ' is not offered directly inside SECTIONS');
        }
    });

    test('MEMORY offers region fields, region attributes and no block keywords', function () {
        const memory = labels('memory');
        for (const id of REGION_FIELD_IDS.concat(REGION_ATTRIBUTE_IDS)) {
            assert.ok(memory.indexOf(id) !== -1, id + ' is offered inside MEMORY');
        }
        assert.strictEqual(memory.indexOf('SECTIONS'), -1, 'block keywords are absent inside MEMORY');
        assert.strictEqual(memory.indexOf('PHDRS'), -1, 'block keywords are absent inside MEMORY');
        assert.strictEqual(memory.indexOf('BYTE'), -1, 'data commands are absent inside MEMORY');

        // Inside MEMORY a region attribute is an assignment, not a call, so the
        // inserted text must match the form that is legal there.
        assert.strictEqual(entry('ORIGIN').snippet, 'ORIGIN = ${1:expression}');
        assert.strictEqual(entry('LENGTH').snippet, 'LENGTH = ${1:expression}');
    });

    test('offers INSERT only where it is legal, never inside VERSION', function () {
        assert.ok(labels('top').indexOf('INSERT') !== -1, 'INSERT is a top-level command');
        assert.strictEqual(labels('version').indexOf('INSERT'), -1, 'INSERT is not a version-script command');
    });

    test('VERSION offers the version-script commands and no other block keywords', function () {
        const version = labels('version');
        for (const id of VERSION_IDS) {
            assert.ok(version.indexOf(id) !== -1, id + ' is offered inside VERSION');
        }
        for (const id of ['ENTRY', 'SECTIONS', 'INSERT', 'MEMORY']) {
            assert.strictEqual(version.indexOf(id), -1, id + ' is not offered inside VERSION');
        }
    });

    test('VERSION placeholder embeds no newline', function () {
        assert.strictEqual(entry('VERSION').snippet, 'VERSION {\n\t${1:version-script-commands}\n}');
        for (const item of KEYWORDS) {
            const open = item.snippet.indexOf('${');
            if (open === -1) {
                continue;
            }
            const close = item.snippet.indexOf('}', open);
            const placeholder = item.snippet.slice(open, close);
            assert.strictEqual(placeholder.indexOf('\n'), -1, item.id + ' has no newline inside a placeholder');
        }
    });

    test('PROVIDE and friends spell expression correctly and take two arguments', function () {
        assert.strictEqual(entry('PROVIDE').snippet, 'PROVIDE(${1:symbol} = ${2:expression})');
        assert.strictEqual(entry('PROVIDE_HIDDEN').snippet, 'PROVIDE_HIDDEN(${1:symbol} = ${2:expression})');
        assert.strictEqual(entry('ASSERT').snippet, 'ASSERT(${1:expression}, ${2:message})');
        for (const id of ['ASSERT', 'PROVIDE', 'PROVIDE_HIDDEN', 'MIN', 'MAX']) {
            const snippet = entry(id).snippet;
            assert.strictEqual(occurrences(snippet, '${1'), 1, id + ' has a first tab stop');
            assert.strictEqual(occurrences(snippet, '${2'), 1, id + ' has a second tab stop');
            assert.strictEqual(occurrences(snippet, 'experssion'), 0, id + ' is spelled correctly');
        }
    });

    test('GROUP and INPUT show two file placeholders separated by a space', function () {
        assert.strictEqual(entry('GROUP').snippet, 'GROUP(${1:lib.a} ${2:lib2.a})');
        assert.strictEqual(entry('INPUT').snippet, 'INPUT(${1:file.o} ${2:file2.o})');
        for (const id of ['GROUP', 'INPUT']) {
            const snippet = entry(id).snippet;
            assert.strictEqual(occurrences(snippet, '${1:'), 1, id + ' has a first file placeholder');
            assert.strictEqual(occurrences(snippet, '${2:'), 1, id + ' shows how to add a second file');
            assert.ok(snippet.indexOf('} ${2:') !== -1, id + ' separates the files with a space');
        }
    });

    test('SORT offers the pattern form and DISCARD inserts a section description', function () {
        assert.strictEqual(entry('SORT').snippet, 'SORT(${1:.text*})');
        assert.strictEqual(entry('SORT_BY_NAME').snippet, 'SORT_BY_NAME(${1:.text*})');
        assert.strictEqual(entry('DISCARD').snippet, '/DISCARD/ : { *(${1:.comment}) }');
        assert.notStrictEqual(entry('DISCARD').snippet, '/DISCARD/');
    });
});
