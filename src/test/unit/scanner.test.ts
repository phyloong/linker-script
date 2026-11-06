//
// Pure-Node tests for the scope scanner: nesting, section bodies, and every
// condition that must make the result uncertain or unusable.
//

import * as assert from 'assert';
import { formatPath, scanScopes } from '../../keywords/scanner';

function atEnd(text: string): ReturnType<typeof scanScopes> {
    return scanScopes(text);
}

suite('Scope scanner', function () {

    test('an empty document is at the top level', function () {
        const result = atEnd('');
        assert.deepStrictEqual([...result.path], []);
        assert.strictEqual(result.scope, 'top');
        assert.strictEqual(result.uncertain, false);
        assert.strictEqual(result.inCommentOrString, false);
    });

    test('tracks SECTIONS and MEMORY one after another', function () {
        const memory = atEnd('MEMORY {\n  ram : ORIGIN = 0\n');
        assert.deepStrictEqual([...memory.path], ['memory']);
        assert.strictEqual(formatPath(memory.path), 'memory');

        const backOutside = atEnd('MEMORY {\n  ram : ORIGIN = 0\n}\nSECTIONS {\n');
        assert.deepStrictEqual([...backOutside.path], ['sections'], 'the MEMORY frame was popped');
    });

    test('reports sections > section-body inside an output section body', function () {
        const body = atEnd('SECTIONS {\n  .text : {\n    ');
        assert.deepStrictEqual([...body.path], ['sections', 'section-body']);
        assert.strictEqual(body.scope, 'section-body');
        assert.strictEqual(formatPath(body.path), 'sections > section-body');

        const sectionLevel = atEnd('SECTIONS {\n  .text : { }\n  ');
        assert.deepStrictEqual([...sectionLevel.path], ['sections']);
        assert.strictEqual(sectionLevel.scope, 'sections');
    });

    test('keeps nested braces inside VERSION in the version scope', function () {
        const result = atEnd('VERSION {\n  VERS_1.0 {\n    global:\n');
        assert.deepStrictEqual([...result.path], ['version', 'version']);
    });

    test('ignores braces and keywords inside comments and strings', function () {
        const commented = atEnd('/* SECTIONS { */\n');
        assert.deepStrictEqual([...commented.path], []);
        assert.strictEqual(commented.uncertain, false);

        const quoted = atEnd('OUTPUT_FORMAT("SECTIONS {")');
        assert.deepStrictEqual([...quoted.path], []);
        assert.strictEqual(quoted.uncertain, false);

        // Single quotes behave the same way: the grammar colors them as a
        // string literal too, so a brace inside them opens nothing.
        const singleQuoted = atEnd("OUTPUT_FORMAT('SECTIONS {')");
        assert.deepStrictEqual([...singleQuoted.path], []);
        assert.strictEqual(singleQuoted.uncertain, false);
    });

    test('a stray closing brace makes the result uncertain', function () {
        const result = atEnd('}\n');
        assert.strictEqual(result.uncertain, true);
        assert.strictEqual(result.reason, 'stray-closing-brace');
    });

    test('a stray closing brace after valid blocks still makes the result uncertain', function () {
        const result = scanScopes('SECTIONS {\n}\n}\n', 'SECTIONS {\n}\n}\n'.length);
        assert.strictEqual(result.uncertain, true);
        assert.strictEqual(result.reason, 'stray-closing-brace');
    });

    test('an unterminated comment makes the result uncertain', function () {
        const result = atEnd('/* SECTIONS {\n');
        assert.strictEqual(result.uncertain, true);
        assert.strictEqual(result.reason, 'unterminated-comment');
        assert.strictEqual(result.inCommentOrString, false);
    });

    test('a comment that closes after the cursor puts the cursor inside it', function () {
        const text = 'SECTIONS {\n  /* cursor\n  */\n}\n';
        const result = scanScopes(text, text.indexOf('cursor'));
        assert.strictEqual(result.inCommentOrString, true);
        assert.strictEqual(result.uncertain, false);
    });

    test('a cursor inside a string literal is reported', function () {
        const text = 'OUTPUT_FORMAT("elf64-x86-64")\n';
        const result = scanScopes(text, text.indexOf('elf64') + 2);
        assert.strictEqual(result.inCommentOrString, true);
    });

    test('a cursor inside a single-quoted string literal is reported', function () {
        const text = "OUTPUT_FORMAT('elf64-x86-64')\n";
        const result = scanScopes(text, text.indexOf('elf64') + 2);
        assert.strictEqual(result.inCommentOrString, true);
    });

    test('a comment opener inside single quotes does not start a comment', function () {
        const text = "OUTPUT_FORMAT('a /* b')\n";
        const result = atEnd(text);
        assert.strictEqual(result.uncertain, false);
        assert.strictEqual(result.reason, null);
        assert.strictEqual(result.inCommentOrString, false);
    });

    test('INCLUDE before the cursor makes the result uncertain', function () {
        const result = atEnd('INCLUDE other.lds\n');
        assert.strictEqual(result.uncertain, true);
        assert.strictEqual(result.reason, 'include');
    });

    test('INCLUDE inside a comment is not a command', function () {
        const result = atEnd('/* INCLUDE other.lds */\n');
        assert.strictEqual(result.uncertain, false);
    });

    test('scanning only reads the prefix before the cursor', function () {
        const text = 'INCLUDE other.lds\nSECTIONS {\n';
        const result = scanScopes(text, 0);
        assert.strictEqual(result.uncertain, false);
        assert.strictEqual(result.path.length, 0);
    });

    test('scans a several-thousand-line script without error', function () {
        const lines: string[] = [];
        for (let section = 0; section < 500; section += 1) {
            lines.push('SECTIONS {');
            lines.push('  .sec' + section + ' : {');
            lines.push('    *(.text.' + section + ')');
            lines.push('    BYTE(0)');
            lines.push('  }');
            lines.push('}');
            lines.push('MEMORY {');
            lines.push('  ram : ORIGIN = 0, LENGTH = 1M');
            lines.push('}');
            lines.push('');
        }
        const text = lines.join('\n');
        assert.ok(lines.length >= 5000, 'the synthetic script has several thousand lines');

        const result = scanScopes(text, text.length);

        assert.strictEqual(result.path.length, 0);
        assert.strictEqual(result.uncertain, false);
    });
});
