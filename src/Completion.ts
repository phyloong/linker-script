'use strict';
import * as vscode from 'vscode';

export class CompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument,
                           position: vscode.Position,
                           token: vscode.CancellationToken,
                           context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const sizeofHeaders = new vscode.CompletionItem('SIZEOF_HEADERS');
        sizeofHeaders.kind = vscode.CompletionItemKind.Field;
        sizeofHeaders.insertText = new vscode.SnippetString("SIZEOF_HEADERS");

        const sections = new vscode.CompletionItem('SECTIONS');
        sections.kind = vscode.CompletionItemKind.Keyword;
        sections.insertText = new vscode.SnippetString("SECTIONS {\n\t${1}\n}");

        return [
            sizeofHeaders,
            sections
        ];
    }

    // resolveCompletionItem(item: CompletionItem,
    //                               token: CancellationToken): ProviderResult<CompletionItem> {

    // }
}
