/**
 * Keyword registry: the single source of truth for completion data.
 *
 * This module deliberately imports nothing from 'vscode' so the plain-Node
 * unit tests can assert every invariant (kind, snippet, scopes) without an
 * extension host. src/Completion.ts is the only place that turns an entry
 * into a vscode.CompletionItem.
 */

/** Where a keyword may legally appear, as far as completion filtering cares. */
export type KeywordScope =
    | 'top'
    | 'sections'
    | 'section-body'
    | 'memory'
    | 'phdrs'
    | 'version'
    | 'overlay';

/** Category of keyword; rendered to a CompletionItemKind in src/Completion.ts. */
export type KeywordKind = 'block' | 'command' | 'function' | 'field' | 'keyword';

export interface KeywordEntry {
    /** Completion label and lookup key; unique across the registry. */
    readonly id: string;
    readonly kind: KeywordKind;
    /** Snippet text inserted when the item is accepted. */
    readonly snippet: string;
    /** One-line description; hover will read the same field. */
    readonly documentation: string;
    /** Scopes in which the keyword is offered. */
    readonly scopes: readonly KeywordScope[];
}

// Expression functions are legal wherever an expression is: top level,
// section descriptions, and section bodies. They are not offered inside
// MEMORY or VERSION, where expressions are rare and the item set is narrow.
const EXPRESSION_SCOPES: readonly KeywordScope[] = ['top', 'sections', 'section-body', 'overlay'];

// Commands legal both at top level and directly inside SECTIONS, but not in an
// output section body (see the spec scenario "Inside an output section body").
const TOP_AND_SECTIONS: readonly KeywordScope[] = ['top', 'sections', 'overlay'];

export const KEYWORDS: readonly KeywordEntry[] = [
    // ---------------------------------------------------------------- top level
    {
        id: 'ENTRY',
        kind: 'command',
        snippet: 'ENTRY(${1:symbol})',
        documentation: 'Set the entry point symbol recorded in the output file.',
        scopes: ['top']
    },
    {
        id: 'OUTPUT_FORMAT',
        kind: 'command',
        snippet: 'OUTPUT_FORMAT(${1:bfdname})',
        documentation: 'Select the output object file format, for example elf64-x86-64.',
        scopes: ['top']
    },
    {
        id: 'OUTPUT_ARCH',
        kind: 'command',
        snippet: 'OUTPUT_ARCH(${1:bfdarch})',
        documentation: 'Set the machine architecture recorded in the output file.',
        scopes: ['top']
    },
    {
        id: 'OUTPUT',
        kind: 'command',
        snippet: 'OUTPUT(${1:filename})',
        documentation: 'Set the name of the output file.',
        scopes: ['top']
    },
    {
        id: 'INPUT',
        kind: 'command',
        snippet: 'INPUT(${1:file.o} ${2:file2.o})',
        documentation: 'Add object files or archives to the link, in the order given.',
        scopes: ['top']
    },
    {
        id: 'GROUP',
        kind: 'command',
        snippet: 'GROUP(${1:lib.a} ${2:lib2.a})',
        documentation: 'Like INPUT, but archives are searched repeatedly until no new undefined references appear.',
        scopes: ['top']
    },
    {
        id: 'SEARCH_DIR',
        kind: 'command',
        snippet: 'SEARCH_DIR(${1:path})',
        documentation: 'Add a directory to the archive search path.',
        scopes: ['top']
    },
    {
        id: 'STARTUP',
        kind: 'command',
        snippet: 'STARTUP(${1:filename})',
        documentation: 'Make the named file the first input file.',
        scopes: ['top']
    },
    {
        id: 'TARGET',
        kind: 'command',
        snippet: 'TARGET(${1:bfdname})',
        documentation: 'Set the BFD format of the output file.',
        scopes: ['top']
    },
    {
        id: 'ASSERT',
        kind: 'command',
        snippet: 'ASSERT(${1:expression}, ${2:message})',
        documentation: 'Abort the link with a message when the expression evaluates to zero.',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'EXTERN',
        kind: 'command',
        snippet: 'EXTERN(${1:symbol})',
        documentation: 'Force a symbol to be entered in the output file as an undefined symbol.',
        scopes: ['top']
    },
    {
        id: 'INCLUDE',
        kind: 'command',
        snippet: 'INCLUDE ${1:filename}',
        documentation: 'Include another linker script at this point.',
        scopes: ['top']
    },
    {
        id: 'PROVIDE',
        kind: 'command',
        snippet: 'PROVIDE(${1:symbol} = ${2:expression})',
        documentation: 'Define a symbol only when it is referenced and not already defined.',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'PROVIDE_HIDDEN',
        kind: 'command',
        snippet: 'PROVIDE_HIDDEN(${1:symbol} = ${2:expression})',
        documentation: 'Like PROVIDE, and hide the symbol from the dynamic symbol table.',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'INSERT',
        kind: 'command',
        snippet: 'INSERT ${1:AFTER} ${2:.text}',
        documentation: 'Insert the preceding script statements before or after an existing output section; used with -T to augment the default SECTIONS.',
        scopes: ['top']
    },
    {
        id: 'FORCE_COMMON_ALLOCATION',
        kind: 'keyword',
        snippet: 'FORCE_COMMON_ALLOCATION',
        documentation: 'Allocate common symbols even when the output format does not require it.',
        scopes: ['top']
    },
    {
        id: 'NOCROSSREFS',
        kind: 'command',
        snippet: 'NOCROSSREFS(${1:.text} ${2:.data})',
        documentation: 'Report an error when sections in the list refer to each other.',
        scopes: ['top']
    },
    {
        id: 'LD_FEATURE',
        kind: 'command',
        snippet: 'LD_FEATURE(${1:string})',
        documentation: 'Request a linker feature, for example SANE_EXPR.',
        scopes: ['top']
    },
    {
        id: 'REGION_ALIAS',
        kind: 'command',
        snippet: 'REGION_ALIAS(${1:alias}, ${2:region})',
        documentation: 'Give an alias to a memory region for use in output section attributes.',
        scopes: ['top']
    },

    // ------------------------------------------------------------------- blocks
    {
        id: 'SECTIONS',
        kind: 'block',
        snippet: 'SECTIONS {\n\t${1}\n}',
        documentation: 'Describe the memory layout of the output file.',
        scopes: ['top']
    },
    {
        id: 'MEMORY',
        kind: 'block',
        snippet: 'MEMORY {\n\t${1}\n}',
        documentation: 'Describe memory regions and their attributes.',
        scopes: ['top']
    },
    {
        id: 'PHDRS',
        kind: 'block',
        snippet: 'PHDRS {\n\t${1}\n}',
        documentation: 'Describe the program headers written to the output file.',
        scopes: ['top']
    },
    {
        id: 'VERSION',
        kind: 'block',
        snippet: 'VERSION {\n\t${1:version-script-commands}\n}',
        documentation: 'Describe the symbol versions exported by the output file.',
        scopes: ['top']
    },
    {
        id: 'OVERLAY',
        kind: 'block',
        snippet: 'OVERLAY ${1:address} : ${2:AT(load_address)} {\n\t${3}\n}',
        documentation: 'Describe sections that share the same load address inside SECTIONS.',
        scopes: ['sections']
    },

    // ------------------------------------------------- output section level items
    {
        id: 'KEEP',
        kind: 'command',
        snippet: 'KEEP(*(${1:.text}))',
        documentation: 'Keep an input section even when a garbage collection pass would drop it.',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'SORT',
        kind: 'command',
        snippet: 'SORT(${1:.text*})',
        documentation: 'Sort matching input sections by name; SORT_BY_NAME is the explicit form.',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'SORT_BY_NAME',
        kind: 'command',
        snippet: 'SORT_BY_NAME(${1:.text*})',
        documentation: 'Sort matching input sections by name.',
        scopes: ['section-body']
    },
    {
        id: 'SORT_BY_ALIGNMENT',
        kind: 'command',
        snippet: 'SORT_BY_ALIGNMENT(${1:.text*})',
        documentation: 'Sort matching input sections by alignment, largest first.',
        scopes: ['section-body']
    },
    {
        id: 'SORT_BY_INIT_PRIORITY',
        kind: 'command',
        snippet: 'SORT_BY_INIT_PRIORITY(${1:.init_array.*})',
        documentation: 'Sort matching input sections by their constructor priority.',
        scopes: ['section-body']
    },
    {
        id: 'DISCARD',
        kind: 'keyword',
        snippet: '/DISCARD/ : { *(${1:.comment}) }',
        documentation: 'Collect the input sections that should not appear in the output file.',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'NOLOAD',
        kind: 'keyword',
        snippet: 'NOLOAD',
        documentation: 'Mark the output section so that it is not loaded into memory.',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'DSECT',
        kind: 'keyword',
        snippet: 'DSECT',
        documentation: 'Mark the output section as a dummy section.',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'COPY',
        kind: 'keyword',
        snippet: 'COPY',
        documentation: 'Mark the output section so that it is not allocated and not loaded.',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'INFO',
        kind: 'keyword',
        snippet: 'INFO',
        documentation: 'Mark the output section so that it is not allocated.',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'CREATE_OBJECT_SYMBOLS',
        kind: 'keyword',
        snippet: 'CREATE_OBJECT_SYMBOLS',
        documentation: 'Create a symbol for every input file in the section.',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'CONSTRUCTORS',
        kind: 'keyword',
        snippet: 'CONSTRUCTORS',
        documentation: 'Emit the C++ constructor and destructor tables for the section.',
        scopes: ['sections', 'section-body', 'overlay']
    },

    // -------------------------------------------------------- section body items
    {
        id: 'BYTE',
        kind: 'command',
        snippet: 'BYTE(${1:expression})',
        documentation: 'Emit one byte at the current location.',
        scopes: ['section-body']
    },
    {
        id: 'SHORT',
        kind: 'command',
        snippet: 'SHORT(${1:expression})',
        documentation: 'Emit a two-byte value at the current location.',
        scopes: ['section-body']
    },
    {
        id: 'LONG',
        kind: 'command',
        snippet: 'LONG(${1:expression})',
        documentation: 'Emit a four-byte value at the current location.',
        scopes: ['section-body']
    },
    {
        id: 'QUAD',
        kind: 'command',
        snippet: 'QUAD(${1:expression})',
        documentation: 'Emit an eight-byte value at the current location.',
        scopes: ['section-body']
    },
    {
        id: 'SQUAD',
        kind: 'command',
        snippet: 'SQUAD(${1:expression})',
        documentation: 'Emit a signed eight-byte value at the current location.',
        scopes: ['section-body']
    },
    {
        id: 'FILL',
        kind: 'command',
        snippet: 'FILL(${1:expression})',
        documentation: 'Set the fill pattern used for padding in the section.',
        scopes: ['section-body']
    },
    {
        id: 'ALIGN',
        kind: 'function',
        snippet: 'ALIGN(${1:expression})',
        documentation: 'Advance the location counter to the next multiple of the expression.',
        scopes: ['top', 'section-body']
    },

    // ------------------------------------------------------------------- MEMORY
    {
        id: 'ORIGIN',
        kind: 'field',
        snippet: 'ORIGIN = ${1:expression}',
        documentation: 'Start address of a memory region, also written as org or o.',
        scopes: ['memory']
    },
    {
        id: 'LENGTH',
        kind: 'field',
        snippet: 'LENGTH = ${1:expression}',
        documentation: 'Size of a memory region, also written as len or l.',
        scopes: ['memory']
    },
    // The optional (attr) list of a memory region, one item per documented
    // attribute so the letters are discoverable inside MEMORY.
    {
        id: 'R',
        kind: 'keyword',
        snippet: 'R',
        documentation: 'Memory region attribute: the region holds read-only sections.',
        scopes: ['memory']
    },
    {
        id: 'W',
        kind: 'keyword',
        snippet: 'W',
        documentation: 'Memory region attribute: the region holds read/write sections.',
        scopes: ['memory']
    },
    {
        id: 'X',
        kind: 'keyword',
        snippet: 'X',
        documentation: 'Memory region attribute: the region holds executable sections.',
        scopes: ['memory']
    },
    {
        id: 'A',
        kind: 'keyword',
        snippet: 'A',
        documentation: 'Memory region attribute: the region holds allocatable sections.',
        scopes: ['memory']
    },
    {
        id: 'I',
        kind: 'keyword',
        snippet: 'I',
        documentation: 'Memory region attribute: the region holds initialized sections.',
        scopes: ['memory']
    },
    {
        id: 'L',
        kind: 'keyword',
        snippet: 'L',
        documentation: 'Memory region attribute: same as I, initialized sections.',
        scopes: ['memory']
    },
    {
        id: '!',
        kind: 'keyword',
        snippet: '!',
        documentation: 'Memory region attribute: invert the sense of the attributes that follow.',
        scopes: ['memory']
    },

    // -------------------------------------------------------------------- PHDRS
    {
        id: 'PT_NULL',
        kind: 'field',
        snippet: 'PT_NULL',
        documentation: 'Program header type: unused entry.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_LOAD',
        kind: 'field',
        snippet: 'PT_LOAD',
        documentation: 'Program header type: loadable segment.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_DYNAMIC',
        kind: 'field',
        snippet: 'PT_DYNAMIC',
        documentation: 'Program header type: dynamic linking information.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_INTERP',
        kind: 'field',
        snippet: 'PT_INTERP',
        documentation: 'Program header type: program interpreter path.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_NOTE',
        kind: 'field',
        snippet: 'PT_NOTE',
        documentation: 'Program header type: note segment.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_SHLIB',
        kind: 'field',
        snippet: 'PT_SHLIB',
        documentation: 'Program header type: reserved shared library entry.',
        scopes: ['phdrs']
    },
    {
        id: 'PT_PHDR',
        kind: 'field',
        snippet: 'PT_PHDR',
        documentation: 'Program header type: the program header table itself.',
        scopes: ['phdrs']
    },

    // ----------------------------------------------------- expression functions
    {
        id: 'ABSOLUTE',
        kind: 'function',
        snippet: 'ABSOLUTE(${1:expression})',
        documentation: 'Use the expression as an absolute address instead of a section relative one.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'ADDR',
        kind: 'function',
        snippet: 'ADDR(${1:section})',
        documentation: 'Return the address of the named section.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'BLOCK',
        kind: 'function',
        snippet: 'BLOCK(${1:expression})',
        documentation: 'Alias for ALIGN that advances the location counter.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'DEFINED',
        kind: 'function',
        snippet: 'DEFINED(${1:symbol})',
        documentation: 'Return one when the symbol is defined, zero otherwise.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'LOADADDR',
        kind: 'function',
        snippet: 'LOADADDR(${1:section})',
        documentation: 'Return the load address of the named section.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'MAX',
        kind: 'function',
        snippet: 'MAX(${1:expression1}, ${2:expression2})',
        documentation: 'Return the larger of the two expressions.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'MIN',
        kind: 'function',
        snippet: 'MIN(${1:expression1}, ${2:expression2})',
        documentation: 'Return the smaller of the two expressions.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'NEXT',
        kind: 'function',
        snippet: 'NEXT(${1:expression})',
        documentation: 'Return the next address that follows the expression and is suitably aligned.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'SIZEOF',
        kind: 'function',
        snippet: 'SIZEOF(${1:section})',
        documentation: 'Return the size of the named section.',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'SIZEOF_HEADERS',
        kind: 'field',
        snippet: 'SIZEOF_HEADERS',
        documentation: 'Size in bytes of the ELF program headers.',
        scopes: EXPRESSION_SCOPES
    }
];

/**
 * Entries offered in a single scope, in registry order.
 *
 * The filter is one-directional: an entry is offered exactly where its scopes
 * list names the scope, which keeps the table auditable.
 */
export function keywordsForScope(scope: KeywordScope): KeywordEntry[] {
    return KEYWORDS.filter((entry) => entry.scopes.indexOf(scope) !== -1);
}
