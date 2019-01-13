'use strict';
import * as vscode from 'vscode';
import { start } from 'repl';

export class CompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument,
                           position: vscode.Position,
                           token: vscode.CancellationToken,
                           context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const sizeofHeaders = new vscode.CompletionItem('SIZEOF_HEADERS');
        sizeofHeaders.kind = vscode.CompletionItemKind.Field;
        sizeofHeaders.insertText = new vscode.SnippetString("SIZEOF_HEADERS");

        const sections = new vscode.CompletionItem('SECTIONS');
        sections.kind = vscode.CompletionItemKind.Struct;
        sections.insertText = new vscode.SnippetString("SECTIONS {\n\t${1}\n}");

        const entry = new vscode.CompletionItem('ENTRY');
        entry.kind = vscode.CompletionItemKind.Method;
        entry.insertText = new vscode.SnippetString("ENTRY(${1:symbol})");

        const include = new vscode.CompletionItem('INCLUDE');
        include.kind = vscode.CompletionItemKind.Keyword;
        include.insertText = new vscode.SnippetString("INCLUDE ${1:filename}");

        const input = new vscode.CompletionItem('INPUT');
        input.kind = vscode.CompletionItemKind.Method;
        input.insertText = new vscode.SnippetString("INPUT(${1:file})");

        const group = new vscode.CompletionItem('GROUP');
        group.kind = vscode.CompletionItemKind.Method;
        group.insertText = new vscode.SnippetString("GROUP(${1:file})");

        const output = new vscode.CompletionItem('OUTPUT');
        output.kind = vscode.CompletionItemKind.Method;
        output.insertText = new vscode.SnippetString("OUTPUT(${1:filename})");

        const searchDir = new vscode.CompletionItem('SEARCH_DIR');
        searchDir.kind = vscode.CompletionItemKind.Method;
        searchDir.insertText = new vscode.SnippetString("SEARCH_DIR(${1:path})");

        const startup = new vscode.CompletionItem('STARTUP');
        startup.kind = vscode.CompletionItemKind.Method;
        startup.insertText = new vscode.SnippetString("STARTUP(${1:filename})");

        const outputFormat = new vscode.CompletionItem('OUTPUT_FORMAT');
        outputFormat.kind = vscode.CompletionItemKind.Method;
        outputFormat.insertText = new vscode.SnippetString("OUTPUT_FORMAT(${1:bfdname})");

        const target = new vscode.CompletionItem('TARGET');
        target.kind = vscode.CompletionItemKind.Method;
        target.insertText = new vscode.SnippetString("TARGET(${1:bfdname})");

        const assert = new vscode.CompletionItem('ASSERT');
        assert.kind = vscode.CompletionItemKind.Method;
        assert.insertText = new vscode.SnippetString("ASSERT(${1:exp}, ${2:message})");

        const extern = new vscode.CompletionItem('EXTERN');
        extern.kind = vscode.CompletionItemKind.Method;
        extern.insertText = new vscode.SnippetString("EXTERN(${1:symbol})");

        const forceCommonAllocation = new vscode.CompletionItem("FORCE_COMMON_ALLOCATION");
        forceCommonAllocation.kind = vscode.CompletionItemKind.Keyword;
        forceCommonAllocation.insertText = new vscode.SnippetString("FORCE_COMMON_ALLOCATION");

        const noCrossRefs = new vscode.CompletionItem('NOCROSSREFS');
        noCrossRefs.kind = vscode.CompletionItemKind.Method;
        noCrossRefs.insertText = new vscode.SnippetString("NOCROSSREFS(${1:section})");

        const outputArch = new vscode.CompletionItem('OUTPUT_ARCH');
        outputArch.kind = vscode.CompletionItemKind.Method;
        outputArch.insertText = new vscode.SnippetString("OUTPUT_ARCH(${1:bfdarch})");

        const provide = new vscode.CompletionItem('PROVIDE');
        provide.kind = vscode.CompletionItemKind.Method;
        provide.insertText = new vscode.SnippetString("PROVIDE(${1:symbol} = ${2:experssion})");

        const byte = new vscode.CompletionItem('BYTE');
        byte.kind = vscode.CompletionItemKind.Method;
        byte.insertText = new vscode.SnippetString("BYTE(${1})");

        const short = new vscode.CompletionItem('SHORT');
        short.kind = vscode.CompletionItemKind.Method;
        short.insertText = new vscode.SnippetString("SHORT(${1})");

        const long = new vscode.CompletionItem('LONG');
        long.kind = vscode.CompletionItemKind.Method;
        long.insertText = new vscode.SnippetString("LONG(${1})");

        const quad = new vscode.CompletionItem('QUAD');
        quad.kind = vscode.CompletionItemKind.Method;
        quad.insertText = new vscode.SnippetString("QUAD(${1})");

        const fill = new vscode.CompletionItem('FILL');
        fill.kind = vscode.CompletionItemKind.Method;
        fill.insertText = new vscode.SnippetString("FILL(${1})");

        const createObjSym = new vscode.CompletionItem('CREATE_OBJECT_SYMBOLS');
        createObjSym.kind = vscode.CompletionItemKind.Keyword;
        createObjSym.insertText = new vscode.SnippetString("CREATE_OBJECT_SYMBOLS");

        const constructor = new vscode.CompletionItem('CONSTRUCTORS');
        constructor.kind = vscode.CompletionItemKind.Keyword;
        constructor.insertText = new vscode.SnippetString("CONSTRUCTORS");

        const sort = new vscode.CompletionItem('SORT');
        sort.kind = vscode.CompletionItemKind.Method;
        sort.insertText = new vscode.SnippetString("SORT(${1:symbol})");

        const discard = new vscode.CompletionItem('DISCARD');
        discard.kind = vscode.CompletionItemKind.Keyword;
        discard.insertText = new vscode.SnippetString("/DISCARD/");

        const noload = new vscode.CompletionItem('NOLOAD');
        noload.kind = vscode.CompletionItemKind.Keyword;
        noload.insertText = new vscode.SnippetString("NOLOAD");

        const dsect = new vscode.CompletionItem('DSECT');
        dsect.kind = vscode.CompletionItemKind.Keyword;
        dsect.insertText = new vscode.SnippetString("DSECT");

        const copy = new vscode.CompletionItem('COPY');
        copy.kind = vscode.CompletionItemKind.Keyword;
        copy.insertText = new vscode.SnippetString("COPY");

        const info = new vscode.CompletionItem('INFO');
        info.kind = vscode.CompletionItemKind.Keyword;
        info.insertText = new vscode.SnippetString("INFO");

        const overlay = new vscode.CompletionItem('OVERLAY');
        overlay.kind = vscode.CompletionItemKind.Keyword;
        overlay.insertText = new vscode.SnippetString("OVERLAY");

        const memory = new vscode.CompletionItem('MEMORY');
        memory.kind = vscode.CompletionItemKind.Struct;
        memory.insertText = new vscode.SnippetString("MEMORY{\n\t${1}\n}");

        const phdrs = new vscode.CompletionItem('PHDRS');
        phdrs.kind = vscode.CompletionItemKind.Struct;
        phdrs.insertText = new vscode.SnippetString("PHDRS{\n\t${1}\n}");

        const ptNull = new vscode.CompletionItem('PT_NULL');
        ptNull.kind = vscode.CompletionItemKind.Keyword;
        ptNull.insertText = new vscode.SnippetString("PT_NULL");

        const ptLoad = new vscode.CompletionItem('PT_LOAD');
        ptLoad.kind = vscode.CompletionItemKind.Keyword;
        ptLoad.insertText = new vscode.SnippetString("PT_LOAD");

        const ptDynamic = new vscode.CompletionItem('PT_DYNAMIC');
        ptDynamic.kind = vscode.CompletionItemKind.Keyword;
        ptDynamic.insertText = new vscode.SnippetString("PT_DYNAMIC");

        const ptInterp = new vscode.CompletionItem('PT_INTERP');
        ptInterp.kind = vscode.CompletionItemKind.Keyword;
        ptInterp.insertText = new vscode.SnippetString("PT_INTERP");

        const ptNote = new vscode.CompletionItem('PT_NOTE');
        ptNote.kind = vscode.CompletionItemKind.Keyword;
        ptNote.insertText = new vscode.SnippetString("PT_NOTE");

        const ptShlib = new vscode.CompletionItem('PT_SHLIB');
        ptShlib.kind = vscode.CompletionItemKind.Keyword;
        ptShlib.insertText = new vscode.SnippetString("PT_SHLIB");

        const ptPhdr = new vscode.CompletionItem('PT_PHDR');
        ptPhdr.kind = vscode.CompletionItemKind.Keyword;
        ptPhdr.insertText = new vscode.SnippetString("PT_PHDR");

        const version = new vscode.CompletionItem('VERSION');
        version.kind = vscode.CompletionItemKind.Struct;
        version.insertText = new vscode.SnippetString("VERSION{\n\t${1:version-script-commands\n}}");

        const absolate = new vscode.CompletionItem('ABSOLUTE');
        absolate.kind = vscode.CompletionItemKind.Function;
        absolate.insertText = new vscode.SnippetString("ABSOLUTE(${1:exp})");

        const addr = new vscode.CompletionItem('ADDR');
        addr.kind = vscode.CompletionItemKind.Function;
        addr.insertText = new vscode.SnippetString("ADDR(${1:section})");

        const align = new vscode.CompletionItem('ALIGN');
        align.kind = vscode.CompletionItemKind.Function;
        align.insertText = new vscode.SnippetString("ALIGN(${1:exp})");

        const block = new vscode.CompletionItem('BLOCK');
        block.kind = vscode.CompletionItemKind.Function;
        block.insertText = new vscode.SnippetString("BLOCK(${1:exp})");

        const defined = new vscode.CompletionItem('DEFINED');
        defined.kind = vscode.CompletionItemKind.Function;
        defined.insertText = new vscode.SnippetString("DEFINED(${1:symbol})");

        const loadaddr = new vscode.CompletionItem('LOADADDR');
        loadaddr.kind = vscode.CompletionItemKind.Function;
        loadaddr.insertText = new vscode.SnippetString("LOADADDR(${1:section})");

        const max = new vscode.CompletionItem('MAX');
        max.kind = vscode.CompletionItemKind.Function;
        max.insertText = new vscode.SnippetString("MAX(${1:exp1}, ${2:exp2})");

        const min = new vscode.CompletionItem('MIN');
        min.kind = vscode.CompletionItemKind.Function;
        min.insertText = new vscode.SnippetString("MIN(${1:exp1}, ${2:exp2})");

        const next = new vscode.CompletionItem('NEXT');
        next.kind = vscode.CompletionItemKind.Function;
        next.insertText = new vscode.SnippetString("NEXT(${1:exp})");

        const sizeOf = new vscode.CompletionItem('SIZEOF');
        sizeOf.kind = vscode.CompletionItemKind.Function;
        sizeOf.insertText = new vscode.SnippetString("SIZEOF(${1:section})");

        return [
            sizeofHeaders,
            sections,
            entry,
            include,
            input,
            group,
            output,
            searchDir,
            startup,
            outputFormat,
            target,
            assert,
            extern,
            forceCommonAllocation,
            noCrossRefs,
            outputArch,
            provide,
            byte,
            short,
            long,
            quad,
            fill,
            createObjSym,
            constructor,
            sort,
            discard,
            noload,
            dsect,
            copy,
            info,
            overlay,
            memory,
            phdrs,
            ptNull,
            ptLoad,
            ptDynamic,
            ptInterp,
            ptNote,
            ptShlib,
            ptPhdr,
            version,
            absolate,
            addr,
            align,
            block,
            defined,
            loadaddr,
            max,
            min,
            next,
            sizeOf
        ];
    }

    // resolveCompletionItem(item: CompletionItem,
    //                       token: CancellationToken): ProviderResult<CompletionItem> {

    // }
}
