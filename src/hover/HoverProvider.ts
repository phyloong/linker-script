'use strict';
import * as vscode from 'vscode';
import { KeywordEntry } from '../keywords/registry';
import { keywordById, keywordWordPattern } from '../keywords/lookup';
import { signatureOf } from '../keywords/signature';

/** The tooltip body: signature, one-sentence summary, example. */
function renderHoverMarkdown(entry: KeywordEntry): vscode.MarkdownString {
    const markdown = new vscode.MarkdownString();
    // isTrusted is deliberately left at its false default: the content is only
    // code blocks and prose, so no command link needs to be enabled.
    markdown.appendCodeblock(signatureOf(entry), 'ld');
    // Plain text, not Markdown: a summary containing `_`, a backtick pair or
    // `[x](y)` must show literally in the tooltip instead of turning into
    // emphasis, code or a link.
    markdown.appendText(entry.summary);
    markdown.appendCodeblock(entry.example, 'ld');
    return markdown;
}

export class HoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
        // The registry-derived pattern, not the document word pattern: it keeps
        // ALIGN inside ALIGN(0x10) whole and refuses part of __stack_top.
        const range = document.getWordRangeAtPosition(position, keywordWordPattern());
        if (range === undefined) {
            return undefined;
        }
        const entry = keywordById(document.getText(range));
        if (entry === undefined) {
            return undefined;
        }
        return new vscode.Hover(renderHoverMarkdown(entry), range);
    }
}
