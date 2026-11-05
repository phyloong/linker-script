'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CompletionProvider } from './Completion';
import { HoverProvider } from './hover/HoverProvider';
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

// The slice of the API used for hover registration; injectable for the same
// reason as CompletionProviderRegistrar.
export type HoverProviderRegistrar = (
    selector: vscode.DocumentSelector,
    provider: vscode.HoverProvider
) => vscode.Disposable;

// Registers one hover provider per supported language id, mirroring the
// completion seam so both providers cover exactly the same documents.
export function registerHoverProviders(
    context: Pick<vscode.ExtensionContext, 'subscriptions'>,
    register: HoverProviderRegistrar = vscode.languages.registerHoverProvider
): void {
    const provider = new HoverProvider();
    for (const languageId of SUPPORTED_LANGUAGE_IDS) {
        context.subscriptions.push(register(languageId, provider));
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time a linker script is opened
export function activate(context: vscode.ExtensionContext): void {
    registerCompletionProviders(context);
    registerHoverProviders(context);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
}
