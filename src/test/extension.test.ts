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
import { HoverProvider } from '../hover/HoverProvider';

const EXTENSION_ID = 'amapleaf.linker-script';

// Read while Mocha loads this file, i.e. before any test can activate the
// extension, so the activation test does not depend on the order of the suite.
const activeAtHostStart = vscode.extensions.getExtension(EXTENSION_ID)?.isActive === true;

async function openAndShow(languageId: string): Promise<vscode.TextDocument> {
    const document = await vscode.workspace.openTextDocument({ language: languageId, content: 'SECTIONS' });
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

suite('Extension Tests', function () {

    test('activates for a linker-script document with no workspace folder', async function () {
        assert.strictEqual(vscode.workspace.workspaceFolders, undefined);
        assert.strictEqual(activeAtHostStart, false, 'the extension was not active when the host started');
        await openAndShow('linker-script');
        assert.strictEqual(await waitForActivation(5000), true, 'showing the document activated the extension');
    });

    test('offers keywords to linker-script documents', async function () {
        const labels = await completionLabels(await openAndShow('linker-script'));
        assert.ok(labels.includes('SECTIONS'), 'SECTIONS completion is offered');
    });

    test('offers no keywords to plain text documents', async function () {
        const labels = await completionLabels(await openAndShow('plaintext'));
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
        const document = await openWithContent('\n');
        const items = await completionsAt(document, 0, 0);
        const kinds = new Map<string, vscode.CompletionItemKind | undefined>();
        for (const item of items) {
            kinds.set(labelOf(item), item.kind);
        }
        assert.strictEqual(kinds.get('SECTIONS'), vscode.CompletionItemKind.Struct, 'SECTIONS renders as a block');
        assert.strictEqual(kinds.get('MEMORY'), vscode.CompletionItemKind.Struct, 'MEMORY renders as a block');
        assert.strictEqual(kinds.get('PHDRS'), vscode.CompletionItemKind.Struct, 'PHDRS renders as a block');
        assert.strictEqual(kinds.get('VERSION'), vscode.CompletionItemKind.Struct, 'VERSION renders as a block');
        assert.strictEqual(kinds.get('ALIGN'), vscode.CompletionItemKind.Function, 'ALIGN renders as a function');
        assert.strictEqual(kinds.get('SIZEOF'), vscode.CompletionItemKind.Function, 'SIZEOF renders as a function');
        assert.strictEqual(kinds.get('ENTRY'), vscode.CompletionItemKind.Method, 'ENTRY renders as a command');
        assert.notStrictEqual(kinds.get('SECTIONS'), kinds.get('ENTRY'), 'blocks and commands differ');
    });

    test('shows the signature, summary and example on hover over ALIGN', async function () {
        const document = await openWithContent('SECTIONS {\n    .text : { . = ALIGN(8); *(.text) }\n}\n');
        const hovers = await hoverAt(document, 'ALIGN');
        const text = hoverText(hovers);
        assert.ok(text.indexOf('ALIGN(expression)') !== -1, 'the derived signature is shown: ' + text);
        assert.ok(text.indexOf('location counter') !== -1, 'the summary is shown');
        assert.ok(text.indexOf('ALIGN(8)') !== -1, 'the example is shown');
        // The design asks for fenced blocks, not plain strings: a tooltip that
        // dropped the fences would still satisfy the assertions above.
        assert.ok(hovers[0].contents[0] instanceof vscode.MarkdownString,
            'the tooltip is markdown, not a plain string');
        assert.ok(hovers[0].contents[0].value.indexOf('```ld\nALIGN(expression)\n```') !== -1,
            'the signature is rendered in a fenced code block');
    });

    test('shows the block form on hover over MEMORY', async function () {
        const document = await openWithContent(
            'MEMORY {\n    ram (rwx) : ORIGIN = 0x20000000, LENGTH = 64K\n}\n');
        const text = hoverText(await hoverAt(document, 'MEMORY', 1));
        assert.ok(text.indexOf('MEMORY { ... }') !== -1, 'the collapsed block form is shown: ' + text);
        assert.ok(text.indexOf('memory regions') !== -1, 'the summary is shown');
        assert.ok(text.indexOf('ORIGIN = 0x20000000') !== -1, 'the example is shown');
    });

    test('shows both placements of PROVIDE on hover', async function () {
        const document = await openWithContent(
            'SECTIONS {\n    .text : { *(.text) }\n    PROVIDE(_etext = .);\n}\n');
        const text = hoverText(await hoverAt(document, 'PROVIDE', 1));
        assert.ok(text.indexOf('PROVIDE(symbol = expression)') !== -1, 'the signature is shown: ' + text);
        assert.ok(text.indexOf('top level') !== -1, 'the top-level placement is described');
        assert.ok(text.indexOf('output sections') !== -1, 'the in-SECTIONS placement is described');
    });

    test('shows both placements of ASSERT on hover', async function () {
        const document = await openWithContent(
            'SECTIONS {\n    .text : { *(.text) }\n    ASSERT(SIZEOF(.text) > 0, "empty")\n}\n');
        const text = hoverText(await hoverAt(document, 'ASSERT', 1));
        assert.ok(text.indexOf('ASSERT(expression, message)') !== -1, 'the signature is shown: ' + text);
        assert.ok(text.indexOf('top level') !== -1, 'the top-level placement is described');
        assert.ok(text.indexOf('output sections') !== -1, 'the in-SECTIONS placement is described');
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
