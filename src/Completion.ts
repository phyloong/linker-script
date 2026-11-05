'use strict';
import * as vscode from 'vscode';
import { KEYWORDS, KeywordEntry, KeywordKind, keywordsForScope } from './keywords/registry';
import { scanScopes } from './keywords/scanner';

// Category to editor presentation. Kept here so the registry stays free of the
// vscode module and remains usable from plain-Node tests and hover.
const COMPLETION_KINDS: { readonly [kind in KeywordKind]: vscode.CompletionItemKind } = {
    block: vscode.CompletionItemKind.Struct,
    command: vscode.CompletionItemKind.Method,
    function: vscode.CompletionItemKind.Function,
    field: vscode.CompletionItemKind.Field,
    keyword: vscode.CompletionItemKind.Keyword
};

function renderCompletionItem(entry: KeywordEntry): vscode.CompletionItem {
    const item = new vscode.CompletionItem(entry.id, COMPLETION_KINDS[entry.kind]);
    item.insertText = new vscode.SnippetString(entry.snippet);
    // The same summary string hover shows, so the prose exists only once.
    item.documentation = entry.summary;
    return item;
}

export class CompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument,
                           position: vscode.Position): vscode.CompletionItem[] {
        const scan = scanScopes(document.getText(), document.offsetAt(position));

        // Inside a comment or string there is nothing useful to accept.
        if (scan.inCommentOrString) {
            return [];
        }

        // An uncertain scope means the braces no longer describe the file; a
        // wrong filter is worse than no filter, so offer everything.
        const entries = scan.uncertain ? KEYWORDS : keywordsForScope(scan.scope);
        return entries.map(renderCompletionItem);
    }
}
