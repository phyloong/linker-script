//
// Pure-Node tests for the language manifest, contribution, and editor
// configuration. These run without an extension host, so every check is a
// static assertion over package.json / language-configuration.json plus the
// word-pattern regex behaviour (the automated stand-in for double-click word
// selection, which needs a GUI).
//

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_LANGUAGE_IDS } from '../../languages';

const repoRoot = path.join(__dirname, '..', '..', '..');

interface LanguageContribution {
    id: string;
    aliases: string[];
    extensions: string[];
    configuration: string;
}

interface Manifest {
    engines: { vscode: string };
    activationEvents: string[];
    contributes: { languages: LanguageContribution[] };
}

interface LanguageConfiguration {
    comments: { blockComment?: [string, string]; lineComment?: string };
    brackets: Array<[string, string]>;
    folding: { markers: { start: string; end: string } };
    wordPattern: string;
}

function readJson(fileName: string): unknown {
    return JSON.parse(fs.readFileSync(path.join(repoRoot, fileName), 'utf8'));
}

const manifest = readJson('package.json') as Manifest;
const configuration = readJson('language-configuration.json') as LanguageConfiguration;
const language = manifest.contributes.languages[0];

// Mirrors VS Code's global-regex scan: every match of the pattern in the line
// is one word candidate, which is how selection and hover find boundaries.
function wordsIn(line: string): string[] {
    const wordRegex = new RegExp('(' + configuration.wordPattern + ')', 'g');
    const words: string[] = [];
    let match = wordRegex.exec(line);
    while (match !== null) {
        words.push(match[0]);
        match = wordRegex.exec(line);
    }
    return words;
}

suite('Language support', function () {

    test('supported ids contain the contributed language and the compatibility id', function () {
        assert.deepStrictEqual([...SUPPORTED_LANGUAGE_IDS], ['linker-script', 'ld']);
    });

    test('manifest contributes the linker-script language for .lds and .ld', function () {
        assert.strictEqual(language.id, 'linker-script');
        assert.deepStrictEqual(language.extensions, ['.lds', '.ld']);
        assert.strictEqual(language.aliases[0], 'Linker Script');
        assert.strictEqual(language.configuration, './language-configuration.json');
    });

    test('manifest activates on language events only', function () {
        assert.deepStrictEqual(manifest.activationEvents, ['onLanguage:ld']);
        assert.strictEqual(manifest.engines.vscode, '^1.74.0');
    });

    test('configuration uses block comments and bracket pairs', function () {
        assert.deepStrictEqual(configuration.comments.blockComment, ['/*', '*/']);
        // A lineComment would make toggle-line-comment insert `//` instead.
        assert.strictEqual(configuration.comments.lineComment, undefined);
        assert.deepStrictEqual(configuration.brackets, [['{', '}'], ['[', ']'], ['(', ')']]);
    });

    test('folding markers match block-comment region lines', function () {
        const start = new RegExp(configuration.folding.markers.start);
        const end = new RegExp(configuration.folding.markers.end);
        assert.strictEqual(start.test('/* #region output sections */'), true);
        assert.strictEqual(end.test('  /* #endregion */'), true);
        assert.strictEqual(start.test('.text : { *(.text) }'), false);
    });

    test('word pattern keeps underscored and dotted identifiers whole', function () {
        assert.deepStrictEqual(wordsIn('SORT_BY_NAME'), ['SORT_BY_NAME']);
        assert.deepStrictEqual(wordsIn('  .text.foo = 0x1000;'), ['.text.foo', '0x1000']);
    });
});
