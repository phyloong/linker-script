'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CompletionProvider } from './Completion';
import { SUPPORTED_LANGUAGE_IDS } from './languages';

// The slice of the API used for registration; injectable so tests can record
// which language ids are registered without a second installed extension.
export type CompletionProviderRegistrar = (
    selector: vscode.DocumentSelector,
    provider: vscode.CompletionItemProvider
) => vscode.Disposable;

// Registers one completion provider per supported language id. Split out from
// activate() so tests can drive it with a recording registrar.
export function registerCompletionProviders(
    context: Pick<vscode.ExtensionContext, 'subscriptions'>,
    register: CompletionProviderRegistrar = vscode.languages.registerCompletionItemProvider
): void {
    const provider = new CompletionProvider();
    for (const languageId of SUPPORTED_LANGUAGE_IDS) {
        context.subscriptions.push(register(languageId, provider));
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time a linker script is opened
export function activate(context: vscode.ExtensionContext): void {
    registerCompletionProviders(context);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
}
