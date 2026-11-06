//
// Extension-host tests: they use the real vscode API, so the extension is
// installed from the test build and completion is requested the same way the
// editor does it. The host runs without a workspace folder (see
// .vscode-test.mjs), which covers the single-file, no-folder case.
//
// The package manifest and language configuration are asserted in the
// pure-Node suite (src/test/unit/language.test.ts), which also runs inside
// this host; this file covers the behaviour that needs a real editor.
//
// The `ld` compatibility path cannot be exercised end to end here: VS Code
// rejects unknown language ids (`setTextDocumentLanguage` throws), so a
// document only has languageId `ld` when another extension contributes it.
// Registration for that id is asserted through a recording registrar instead,
// and the provider is driven directly with an `ld` document below.
//

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SUPPORTED_LANGUAGE_IDS } from '../languages';
import { registerCompletionProviders, registerHoverProviders } from '../extension';
import { CompletionProvider } from '../Completion';
import { KEYWORDS } from '../keywords/registry';
import { keywordById } from '../keywords/lookup';
import { signatureOf } from '../keywords/signature';
import { HoverProvider } from '../hover/HoverProvider';

const EXTENSION_ID = 'amapleaf.linker-script';

// Read while Mocha loads this file, i.e. before any test can activate the
// extension, so the activation test does not depend on the order of the suite.
const activeAtHostStart = vscode.extensions.getExtension(EXTENSION_ID)?.isActive === true;

async function openAndShow(languageId: string, content: string = 'SECTIONS'): Promise<vscode.TextDocument> {
    const document = await vscode.workspace.openTextDocument({ language: languageId, content });
    // Showing the document is what the editor does when a user opens a file;
    // that is the event that makes VS Code deliver onLanguage activation.
    await vscode.window.showTextDocument(document);
    return document;
}

async function openWithContent(content: string): Promise<vscode.TextDocument> {
    return openWith('linker-script', content);
}

async function waitForActivation(timeoutMs: number): Promise<boolean> {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension, 'extension is installed in the test host');
    const deadline = Date.now() + timeoutMs;
    while (!extension.isActive && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return extension.isActive;
}

function labelOf(item: vscode.CompletionItem): string {
    return typeof item.label === 'string' ? item.label : item.label.label;
}

// The kind the editor was handed for each label, so one lookup per assertion.
function kindsOf(items: vscode.CompletionItem[]): Map<string, vscode.CompletionItemKind | undefined> {
    const kinds = new Map<string, vscode.CompletionItemKind | undefined>();
    for (const item of items) {
        kinds.set(labelOf(item), item.kind);
    }
    return kinds;
}

async function completionsAt(document: vscode.TextDocument,
                              line: number,
                              character: number): Promise<vscode.CompletionItem[]> {
    const list = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        document.uri,
        new vscode.Position(line, character)
    );
    return list.items;
}

async function labelsAt(document: vscode.TextDocument, line: number, character: number): Promise<string[]> {
    return (await completionsAt(document, line, character)).map(labelOf);
}

async function completionLabels(document: vscode.TextDocument): Promise<string[]> {
    return labelsAt(document, 0, 0);
}

async function openWith(languageId: string, content: string): Promise<vscode.TextDocument> {
    const document = await vscode.workspace.openTextDocument({ language: languageId, content });
    await vscode.window.showTextDocument(document);
    return document;
}

// The editor's own hover command, i.e. the path a mouse dwell takes.
async function hoverAt(document: vscode.TextDocument,
                        needle: string,
                        offsetInNeedle: number = 0): Promise<vscode.Hover[]> {
    const index = document.getText().indexOf(needle);
    assert.ok(index !== -1, 'the sample text contains ' + needle);
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        document.uri,
        document.positionAt(index + offsetInNeedle)
    );
    return hovers === undefined ? [] : hovers;
}

// Flattens every hover a provider chain contributed into one searchable string.
function hoverText(hovers: vscode.Hover[]): string {
    const parts: string[] = [];
    for (const hover of hovers) {
        for (const content of hover.contents) {
            parts.push(typeof content === 'string' ? content : content.value);
        }
    }
    return parts.join('\n');
}

// The tooltip has to be the markdown the design asks for, not a plain string
// that happens to contain the same words: signature block, summary, example
// block. The expected summary and example come from the registry, so this
// checks the rendering rather than a second copy of the prose.
function assertMarkdownTooltip(hover: vscode.Hover, signature: string, keywordId: string): void {
    const entry = keywordById(keywordId);
    if (entry === undefined) {
        assert.fail('the registry contains ' + keywordId);
    }
    const content = hover.contents[0];
    assert.ok(content instanceof vscode.MarkdownString, 'the tooltip is markdown, not a plain string');
    assert.notStrictEqual(content.isTrusted, true,
        'the tooltip renders no command links, so it stays untrusted');
    const value = content.value;
    assert.ok(value.indexOf('```ld\n' + signature + '\n```') !== -1,
        'the signature is rendered in a fenced code block: ' + value);
    // appendText escapes markdown characters, so the expected form of the
    // summary is the one the platform produces for plain text.
    const summaryText = new vscode.MarkdownString().appendText(entry.summary).value;
    assert.ok(value.indexOf(summaryText) !== -1, 'the summary is rendered as text: ' + value);
    assert.ok(value.indexOf('```ld\n' + entry.example + '\n```') !== -1,
        'the example is rendered in a fenced code block: ' + value);
}

suite('Extension Tests', function () {

    test('activates for a linker-script document with no workspace folder', async function () {
        assert.strictEqual(vscode.workspace.workspaceFolders, undefined);
        assert.strictEqual(activeAtHostStart, false, 'the extension was not active when the host started');
        await openAndShow('linker-script');
        assert.strictEqual(await waitForActivation(5000), true, 'showing the document activated the extension');
    });

    // Both documents are blank on purpose: the editor adds its own word-based
    // suggestions for words that occur in the document, so a document spelling
    // the expected label would pass even with no provider registered.
    test('offers keywords to linker-script documents', async function () {
        const labels = await completionLabels(await openAndShow('linker-script', '\n'));
        assert.ok(labels.includes('SECTIONS'), 'SECTIONS completion is offered');
    });

    test('offers no keywords to plain text documents', async function () {
        const labels = await completionLabels(await openAndShow('plaintext', '\n'));
        assert.ok(!labels.includes('SECTIONS'), 'plaintext receives no linker keywords');
        assert.ok(!labels.includes('ENTRY'), 'plaintext receives no linker keywords');
    });

    // Opens real files, so the language id comes from the `extensions`
    // association in contributes.languages rather than from an explicit argument.
    test('maps .lds and .ld files to linker-script and completes in them', async function () {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'linker-script-'));
        try {
            for (const fileName of ['link.lds', 'link.ld']) {
                const filePath = path.join(directory, fileName);
                fs.writeFileSync(filePath, 'SECTIONS\n{\n}\n');
                const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
                await vscode.window.showTextDocument(document);
                assert.strictEqual(document.languageId, 'linker-script', fileName + ' resolves to the contributed language');
                const labels = await completionLabels(document);
                assert.ok(labels.includes('SECTIONS'), fileName + ' receives completions');
            }
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    test('registers one provider per supported language id, including ld', function () {
        const registeredSelectors: string[] = [];
        const subscriptions: vscode.Disposable[] = [];
        registerCompletionProviders({ subscriptions }, (selector) => {
            if (typeof selector !== 'string') {
                throw new Error('expected the language id to be registered as a plain string selector');
            }
            registeredSelectors.push(selector);
            return new vscode.Disposable(() => undefined);
        });
        assert.deepStrictEqual(registeredSelectors, ['linker-script', 'ld']);
        assert.strictEqual(subscriptions.length, SUPPORTED_LANGUAGE_IDS.length);
    });

    test('offers block keywords at the top level', async function () {
        const document = await openWithContent('\n');
        const labels = await labelsAt(document, 0, 0);
        assert.ok(labels.includes('SECTIONS'), 'SECTIONS is offered at the top level');
        assert.ok(labels.includes('MEMORY'), 'MEMORY is offered at the top level');
        assert.ok(labels.includes('ENTRY'), 'ENTRY is offered at the top level');
        assert.ok(!labels.includes('BYTE'), 'data commands are not offered at the top level');
    });

    test('drops block keywords and section-level commands inside a section body', async function () {
        const document = await openWithContent('SECTIONS {\n    .text : {\n        \n    }\n}\n');
        const labels = await labelsAt(document, 2, 8);
        assert.ok(labels.includes('BYTE'), 'data commands are offered in a section body');
        assert.ok(labels.includes('KEEP'), 'input section descriptions are offered in a section body');
        assert.ok(!labels.includes('SECTIONS'), 'SECTIONS is absent inside a section body');
        assert.ok(!labels.includes('MEMORY'), 'MEMORY is absent inside a section body');
        assert.ok(!labels.includes('PROVIDE'), 'PROVIDE is absent inside a section body');
        assert.ok(!labels.includes('ASSERT'), 'ASSERT is absent inside a section body');
    });

    test('keeps section-level items directly inside SECTIONS', async function () {
        const document = await openWithContent('SECTIONS {\n    \n}\n');
        const labels = await labelsAt(document, 1, 4);
        assert.ok(labels.includes('KEEP'), 'KEEP is offered at the output section level');
        assert.ok(labels.includes('SORT'), 'SORT is offered at the output section level');
        assert.ok(labels.includes('DISCARD'), '/DISCARD/ is offered at the output section level');
        assert.ok(labels.includes('PROVIDE'), 'PROVIDE is offered at the output section level');
        assert.ok(!labels.includes('BYTE'), 'data commands are absent at the output section level');
    });

    test('offers region fields and attributes inside MEMORY and no block keywords', async function () {
        const document = await openWithContent('MEMORY {\n    ram (rwx) : ORIGIN = 0x0, LENGTH = 4K\n    \n}\n');
        const labels = await labelsAt(document, 2, 4);
        assert.ok(labels.includes('ORIGIN'), 'ORIGIN is offered inside MEMORY');
        assert.ok(labels.includes('LENGTH'), 'LENGTH is offered inside MEMORY');
        assert.ok(labels.includes('R'), 'region attributes are offered inside MEMORY');
        assert.ok(!labels.includes('SECTIONS'), 'block keywords are absent inside MEMORY');
        assert.ok(!labels.includes('PHDRS'), 'block keywords are absent inside MEMORY');
        assert.ok(!labels.includes('BYTE'), 'data commands are absent inside MEMORY');
    });

    test('offers the version commands inside VERSION and no other block keywords', async function () {
        const document = await openWithContent('VERSION {\n    V1.0 {\n        \n    }\n}\n');
        const labels = await labelsAt(document, 2, 8);
        assert.ok(labels.includes('global'), 'global is offered inside VERSION');
        assert.ok(labels.includes('local'), 'local is offered inside VERSION');
        assert.ok(labels.includes('extern'), 'extern is offered inside VERSION');
        assert.ok(!labels.includes('ENTRY'), 'ENTRY is absent inside VERSION');
        assert.ok(!labels.includes('SECTIONS'), 'SECTIONS is absent inside VERSION');
        assert.ok(!labels.includes('INSERT'), 'INSERT is absent inside VERSION');
    });

    test('returns every keyword when a brace is unbalanced', async function () {
        const document = await openWithContent('SECTIONS {\n}\n}\n');
        const labels = await labelsAt(document, 2, 1);
        // A confident top-level filter would drop the section-body items, so
        // seeing both groups is what proves the fallback ran.
        assert.ok(labels.includes('SECTIONS'), 'top-level items are present');
        assert.ok(labels.includes('BYTE'), 'section-body items are present too');
    });

    test('returns every keyword when an INCLUDE precedes the cursor', async function () {
        const document = await openWithContent('INCLUDE other.lds\nSECTIONS {\n    .text : {\n        \n    }\n}\n');
        const labels = await labelsAt(document, 3, 8);
        assert.ok(labels.includes('SECTIONS'), 'top-level items are present after an INCLUDE');
        assert.ok(labels.includes('BYTE'), 'section-body items are present too');
    });

    // The comment never closes, so the cursor is not inside a comment: the
    // text after the cursor has to decide that, and it finds no `*/`.
    test('returns every keyword when a block comment is never closed', async function () {
        const document = await openWithContent('SECTIONS {\n    /* unfinished\n    \n');
        const position = new vscode.Position(2, 4);
        const labels = await labelsAt(document, position.line, position.character);
        // SECTIONS is a top-level item and BYTE a section-body one, so seeing
        // both is what proves the filtering was skipped rather than misplaced.
        assert.ok(labels.includes('SECTIONS'), 'top-level items are present after an unclosed comment');
        assert.ok(labels.includes('BYTE'), 'section-body items are present too');
        assert.strictEqual(new CompletionProvider().provideCompletionItems(document, position).length, KEYWORDS.length,
            'the provider offers the unfiltered registry');
    });

    test('returns no items inside a block comment', async function () {
        const document = await openWithContent('SECTIONS {\n    /* \n    \n    */\n}\n');
        const labels = await labelsAt(document, 2, 4);
        // VS Code adds its own word-based suggestions, so the editor-level check
        // uses a keyword that cannot appear as a word in the document, and the
        // provider is then called directly to prove the list is really empty.
        assert.ok(!labels.includes('BYTE'), 'no data command is offered inside a comment');
        assert.ok(!labels.includes('PROVIDE'), 'no command is offered inside a comment');
        const provider = new CompletionProvider();
        assert.strictEqual(provider.provideCompletionItems(document, new vscode.Position(2, 4)).length, 0,
            'the provider returns nothing inside /* */');
    });

    test('returns no items inside a string literal', async function () {
        const document = await openWithContent('OUTPUT_FORMAT("elf64-x86-64")\n');
        const provider = new CompletionProvider();
        const position = new vscode.Position(0, 20);
        assert.strictEqual(provider.provideCompletionItems(document, position).length, 0,
            'the provider returns nothing inside a string');
    });

    test('maps registry categories to completion item kinds', async function () {
        const kinds = kindsOf(await completionsAt(await openWithContent('\n'), 0, 0));
        assert.strictEqual(kinds.get('SECTIONS'), vscode.CompletionItemKind.Struct, 'SECTIONS renders as a block');
        assert.strictEqual(kinds.get('MEMORY'), vscode.CompletionItemKind.Struct, 'MEMORY renders as a block');
        assert.strictEqual(kinds.get('PHDRS'), vscode.CompletionItemKind.Struct, 'PHDRS renders as a block');
        assert.strictEqual(kinds.get('VERSION'), vscode.CompletionItemKind.Struct, 'VERSION renders as a block');
        assert.strictEqual(kinds.get('ALIGN'), vscode.CompletionItemKind.Function, 'ALIGN renders as a function');
        assert.strictEqual(kinds.get('SIZEOF'), vscode.CompletionItemKind.Function, 'SIZEOF renders as a function');
        assert.strictEqual(kinds.get('ENTRY'), vscode.CompletionItemKind.Method, 'ENTRY renders as a command');
        assert.notStrictEqual(kinds.get('SECTIONS'), kinds.get('ENTRY'), 'blocks and commands differ');

        // Region fields and plain keywords only appear in their own scopes, so
        // each needs the document that offers it.
        const memoryKinds = kindsOf(await completionsAt(await openWithContent('MEMORY {\n    \n}\n'), 1, 4));
        assert.strictEqual(memoryKinds.get('ORIGIN'), vscode.CompletionItemKind.Field,
            'ORIGIN renders as a region field');
        assert.strictEqual(memoryKinds.get('LENGTH'), vscode.CompletionItemKind.Field,
            'LENGTH renders as a region field');
        const sectionsKinds = kindsOf(await completionsAt(await openWithContent('SECTIONS {\n    \n}\n'), 1, 4));
        assert.strictEqual(sectionsKinds.get('NOLOAD'), vscode.CompletionItemKind.Keyword,
            'NOLOAD renders as a keyword');
    });

    test('shows the signature, summary and example on hover over ALIGN', async function () {
        const document = await openWithContent('SECTIONS {\n    .text : { . = ALIGN(8); *(.text) }\n}\n');
        const hovers = await hoverAt(document, 'ALIGN');
        assert.ok(hovers.length > 0, 'a tooltip is produced');
        // The expected signature, summary and example come from the registry so
        // the check follows the data instead of a second copy of the prose.
        assertMarkdownTooltip(hovers[0], 'ALIGN(expression)', 'ALIGN');
    });

    test('shows the block form on hover over MEMORY', async function () {
        const document = await openWithContent(
            'MEMORY {\n    ram (rwx) : ORIGIN = 0x20000000, LENGTH = 64K\n}\n');
        const hovers = await hoverAt(document, 'MEMORY', 1);
        const text = hoverText(hovers);
        assert.ok(text.indexOf('MEMORY { ... }') !== -1, 'the collapsed block form is shown: ' + text);
        assert.ok(text.indexOf('ORIGIN = 0x20000000') !== -1, 'the example is shown');
        assertMarkdownTooltip(hovers[0], 'MEMORY { ... }', 'MEMORY');
    });

    test('shows the signature, summary and example on hover over the version commands', async function () {
        const document = await openWithContent(
            'VERSION {\n    V1.0 {\n        global: init;\n        local: hidden;\n'
            + '        extern "C++" { foo; };\n    };\n};\n');
        // The expected signature is derived from the snippet in the registry,
        // so a snippet change moves the assertion with it.
        for (const id of ['global', 'local', 'extern']) {
            const hovers = await hoverAt(document, id, 1);
            assert.ok(hovers.length > 0, 'a tooltip is produced for ' + id);
            const entry = keywordById(id);
            if (entry === undefined) {
                assert.fail('the registry contains ' + id);
            }
            assertMarkdownTooltip(hovers[0], signatureOf(entry), id);
        }
    });

    test('shows no hover over a user-defined version node name', async function () {
        const document = await openWithContent('VERSION {\n    V1.0 {\n        global: init;\n    };\n};\n');
        assert.strictEqual((await hoverAt(document, 'V1.0', 0)).length, 0,
            'V1.0 is a user-defined version node name');
    });

    test('shows both placements of PROVIDE on hover', async function () {
        const document = await openWithContent(
            'SECTIONS {\n    .text : { *(.text) }\n    PROVIDE(_etext = .);\n}\n');
        const hovers = await hoverAt(document, 'PROVIDE', 1);
        const text = hoverText(hovers);
        assert.ok(text.indexOf('PROVIDE(symbol = expression)') !== -1, 'the signature is shown: ' + text);
        // The summary names both placements, so asserting it whole covers them.
        assertMarkdownTooltip(hovers[0], 'PROVIDE(symbol = expression)', 'PROVIDE');
    });

    test('shows both placements of ASSERT on hover', async function () {
        const document = await openWithContent(
            'SECTIONS {\n    .text : { *(.text) }\n    ASSERT(SIZEOF(.text) > 0, "empty")\n}\n');
        const hovers = await hoverAt(document, 'ASSERT', 1);
        const text = hoverText(hovers);
        assert.ok(text.indexOf('ASSERT(expression, message)') !== -1, 'the signature is shown: ' + text);
        assertMarkdownTooltip(hovers[0], 'ASSERT(expression, message)', 'ASSERT');
    });

    // Hover is scope-agnostic on purpose: a registered word is answered
    // wherever it appears, comments and strings included.
    test('answers hover inside a comment and a string literal', async function () {
        const comment = await openWithContent('/* MEMORY is only mentioned here */\n');
        const commentHovers = await hoverAt(comment, 'MEMORY', 1);
        assert.ok(commentHovers.length > 0, 'a keyword inside a block comment still has a tooltip');
        assertMarkdownTooltip(commentHovers[0], 'MEMORY { ... }', 'MEMORY');

        const string = await openWithContent('OUTPUT_FORMAT("ALIGN")\n');
        const stringHovers = await hoverAt(string, 'ALIGN', 1);
        assert.ok(stringHovers.length > 0, 'a keyword inside a string literal still has a tooltip');
        assertMarkdownTooltip(stringHovers[0], 'ALIGN(expression)', 'ALIGN');
    });

    test('does not resolve a keyword inside a longer identifier', async function () {
        const document = await openWithContent('_end = MY_ALIGN(8);\n_x = ALIGNMENT;\n');
        assert.strictEqual((await hoverAt(document, 'MY_ALIGN', 3)).length, 0,
            'the ALIGN inside MY_ALIGN does not resolve');
        assert.strictEqual((await hoverAt(document, 'ALIGNMENT', 0)).length, 0,
            'ALIGNMENT does not resolve as ALIGN');
    });

    test('shows no hover over a user-defined symbol or a section name', async function () {
        const symbol = await openWithContent('__stack_top = 0x20000000;\n');
        assert.strictEqual((await hoverAt(symbol, '__stack_top', 2)).length, 0,
            '__stack_top is not a registry keyword');
        const section = await openWithContent('SECTIONS {\n    .text : { *(.text) }\n}\n');
        assert.strictEqual((await hoverAt(section, '.text', 2)).length, 0,
            '.text is a user-defined output section name');
    });

    test('shows no hover in a plain-text document', async function () {
        const document = await openWith('plaintext', 'ALIGN\n');
        assert.strictEqual((await hoverAt(document, 'ALIGN', 1)).length, 0,
            'plaintext gets no hover provider');
    });

    test('registers one hover provider per supported language id, including ld', function () {
        const registeredSelectors: string[] = [];
        const subscriptions: vscode.Disposable[] = [];
        registerHoverProviders({ subscriptions }, (selector) => {
            if (typeof selector !== 'string') {
                throw new Error('expected the language id to be registered as a plain string selector');
            }
            registeredSelectors.push(selector);
            return new vscode.Disposable(() => undefined);
        });
        assert.deepStrictEqual(registeredSelectors, ['linker-script', 'ld']);
        assert.strictEqual(subscriptions.length, SUPPORTED_LANGUAGE_IDS.length);
    });

    // The host cannot assign an unregistered language id to a document, so the
    // ld path is driven through the provider with an ld-shaped document.
    test('serves the same hover to an ld document', function () {
        const document = {
            languageId: 'ld',
            getWordRangeAtPosition: () => new vscode.Range(0, 0, 0, 5),
            getText: () => 'ALIGN'
        } as unknown as vscode.TextDocument;
        const hover = new HoverProvider().provideHover(document, new vscode.Position(0, 2));
        assert.strictEqual(document.languageId, 'ld');
        if (hover === undefined) {
            assert.fail('an ld document receives a hover');
        }
        assert.ok(hoverText([hover]).indexOf('ALIGN(expression)') !== -1);
    });

    test('returns no hover for a word the registry does not know', function () {
        const document = {
            languageId: 'linker-script',
            getWordRangeAtPosition: () => undefined,
            getText: () => 'unknown'
        } as unknown as vscode.TextDocument;
        assert.strictEqual(new HoverProvider().provideHover(document, new vscode.Position(0, 0)), undefined);
    });

    test('gives every completion item a non-empty string documentation', async function () {
        const items = await completionsAt(await openWithContent('\n'), 0, 0);
        assert.ok(items.length > 0, 'the top level offers items');
        for (const item of items) {
            assert.strictEqual(typeof item.documentation, 'string', labelOf(item) + ' documents itself');
            assert.ok((item.documentation as string).length > 0, labelOf(item) + ' documentation is non-empty');
        }
    });

    test('completes an ld document with the same provider', function () {
        const text = 'SECTIONS {\n    .text : {\n';
        const document = {
            languageId: 'ld',
            getText: () => text,
            offsetAt: () => text.length
        } as unknown as vscode.TextDocument;
        const provider = new CompletionProvider();
        const labels = provider.provideCompletionItems(document, new vscode.Position(2, 0)).map(labelOf);
        assert.strictEqual(document.languageId, 'ld');
        assert.ok(labels.includes('BYTE'), 'the ld document is filtered by the same scanner');
        assert.ok(!labels.includes('SECTIONS'), 'the ld document is filtered by the same scanner');
    });
});
