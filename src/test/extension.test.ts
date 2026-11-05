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
// Registration for that id is asserted through a recording registrar instead.
//

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SUPPORTED_LANGUAGE_IDS } from '../languages';
import { registerCompletionProviders } from '../extension';

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

async function waitForActivation(timeoutMs: number): Promise<boolean> {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension, 'extension is installed in the test host');
    const deadline = Date.now() + timeoutMs;
    while (!extension.isActive && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return extension.isActive;
}

async function completionLabels(document: vscode.TextDocument): Promise<string[]> {
    const list = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        document.uri,
        new vscode.Position(0, 0)
    );
    return list.items.map((item) => typeof item.label === 'string' ? item.label : item.label.label);
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
});
