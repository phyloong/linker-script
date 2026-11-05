//
// Pure-Node tests for the hover lookup: exact id matching and the word pattern
// that decides which slice of a line is a candidate.
//

import * as assert from 'assert';
import { KEYWORDS } from '../../keywords/registry';
import { keywordById, keywordWordPattern } from '../../keywords/lookup';

function wordsIn(line: string): string[] {
    const pattern = keywordWordPattern();
    const words: string[] = [];
    let match = pattern.exec(line);
    while (match !== null) {
        words.push(match[0]);
        match = pattern.exec(line);
    }
    return words;
}

suite('Keyword lookup', function () {

    test('resolves a registered id to its entry', function () {
        assert.strictEqual(keywordById('ALIGN')?.id, 'ALIGN');
        assert.strictEqual(keywordById('SECTIONS')?.id, 'SECTIONS');
        assert.strictEqual(keywordById('PROVIDE_HIDDEN')?.id, 'PROVIDE_HIDDEN');
    });

    test('matches only exact ids', function () {
        assert.deepStrictEqual(KEYWORDS.filter((item) => keywordById(item.id) !== item), []);
        for (const unknown of ['align', 'Provide', 'PROVID', 'ALIGNMENT', 'SECTIONS ', ' ALIGN', '', '.text', '__stack_top']) {
            assert.strictEqual(keywordById(unknown), undefined, JSON.stringify(unknown) + ' is not a keyword');
        }
    });

    test('does not fall back to a shorter id when a longer one exists', function () {
        assert.strictEqual(keywordById('PROVIDE_HIDDEN')?.summary,
            'Like PROVIDE, but the defined symbol is also hidden from the dynamic symbol table.');
        assert.notStrictEqual(keywordById('PROVIDE_HIDDEN'), keywordById('PROVIDE'));
    });

    test('word pattern matches a whole keyword and nothing longer', function () {
        assert.deepStrictEqual(wordsIn('ALIGN(0x10)'), ['ALIGN']);
        assert.deepStrictEqual(wordsIn('PROVIDE_HIDDEN(_end = .)'), ['PROVIDE_HIDDEN']);
        assert.deepStrictEqual(wordsIn('SORT_BY_NAME(.ctors.*)'), ['SORT_BY_NAME']);
        assert.deepStrictEqual(wordsIn('PROVIDE(_end = .)'), ['PROVIDE']);
        assert.deepStrictEqual(wordsIn('!rx'), ['!']);
    });

    test('word pattern rejects keywords inside longer identifiers', function () {
        for (const line of ['ALIGNMENT', 'MY_ALIGN', '__stack_top', '.text', '.text.foo', 'xdata']) {
            assert.deepStrictEqual(wordsIn(line), [], line + ' holds no standalone keyword');
        }
    });

    test('word pattern is a fresh global regex per call', function () {
        const first = keywordWordPattern();
        assert.strictEqual(first.global, true, 'VS Code requires a global pattern');
        first.exec('ALIGN');
        assert.strictEqual(first.lastIndex, 5);
        assert.strictEqual(keywordWordPattern().lastIndex, 0, 'the next call starts clean');
    });
});
