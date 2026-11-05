//
// Pure-Node tests for hover signature derivation: the snippet is the only
// source, so these run without an extension host.
//

import * as assert from 'assert';
import { KEYWORDS, KeywordEntry } from '../../keywords/registry';
import { deriveSignature, signatureOf } from '../../keywords/signature';

const SECTIONS_SNIPPET = 'SECTIONS {\n\t${1}\n}';

function entry(id: string): KeywordEntry {
    const found = KEYWORDS.find((item) => item.id === id);
    if (found === undefined) {
        throw new Error('missing registry entry: ' + id);
    }
    return found;
}

suite('Hover signature', function () {

    test('replaces a placeholder with its default', function () {
        assert.strictEqual(deriveSignature('ALIGN(${1:expression})'), 'ALIGN(expression)');
        assert.strictEqual(deriveSignature('PROVIDE(${1:symbol} = ${2:expression})'), 'PROVIDE(symbol = expression)');
        assert.strictEqual(deriveSignature('INPUT(${1:file.o} ${2:file2.o})'), 'INPUT(file.o file2.o)');
        // A ':' inside a default is part of the value, not a placeholder separator.
        assert.strictEqual(deriveSignature('OUTPUT_ARCH(${1:i386:x86-64})'), 'OUTPUT_ARCH(i386:x86-64)');
        assert.strictEqual(deriveSignature('INSERT ${1:AFTER} ${2:.text}'), 'INSERT AFTER .text');
    });

    test('drops a placeholder that has no default', function () {
        assert.strictEqual(deriveSignature('LD_FEATURE(${1})'), 'LD_FEATURE()');
    });

    test('collapses a block body that spans lines', function () {
        assert.strictEqual(deriveSignature(SECTIONS_SNIPPET), 'SECTIONS { ... }');
        assert.strictEqual(deriveSignature(entry('MEMORY').snippet), 'MEMORY { ... }');
        assert.strictEqual(deriveSignature(entry('PHDRS').snippet), 'PHDRS { ... }');
        assert.strictEqual(deriveSignature(entry('VERSION').snippet), 'VERSION { ... }');
        assert.strictEqual(deriveSignature(entry('OVERLAY').snippet),
            'OVERLAY address : AT(load_address) { ... }');
    });

    test('keeps a single-line brace body as written', function () {
        assert.strictEqual(deriveSignature(entry('DISCARD').snippet), '/DISCARD/ : { *(.comment) }');
        assert.strictEqual(deriveSignature(entry('KEEP').snippet), 'KEEP(*(.text))');
    });

    test('renders the three signatures the tasks call out', function () {
        assert.strictEqual(signatureOf(entry('ALIGN')), 'ALIGN(expression)');
        assert.strictEqual(signatureOf(entry('SECTIONS')), 'SECTIONS { ... }');
        assert.strictEqual(signatureOf(entry('PROVIDE')), 'PROVIDE(symbol = expression)');
    });

    test('prefers an explicit override over the derived form', function () {
        const overridden = { snippet: 'FOO(${1:x}, ${2:y})', signature: 'FOO(x, y)' };
        assert.strictEqual(signatureOf(overridden), 'FOO(x, y)');
        const derived = { snippet: 'FOO(${1:x}, ${2:y})' };
        assert.strictEqual(signatureOf(derived), 'FOO(x, y)');
    });

    test('every registry entry renders a single-line, placeholder-free signature', function () {
        for (const item of KEYWORDS) {
            const signature = signatureOf(item);
            assert.ok(signature.length > 0, item.id + ' has a signature');
            assert.strictEqual(signature.indexOf('${'), -1, item.id + ' signature keeps no placeholder');
            assert.strictEqual(signature.indexOf('\n'), -1, item.id + ' signature is one line');
            assert.strictEqual(signature, signature.trim(), item.id + ' signature has no outer spaces');
        }
    });
});
