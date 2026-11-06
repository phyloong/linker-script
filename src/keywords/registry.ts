/**
 * Keyword registry: the single source of truth for completion and hover data.
 *
 * This module deliberately imports nothing from 'vscode' so the plain-Node
 * unit tests can assert every invariant (kind, snippet, scopes, summary,
 * example) without an extension host. src/Completion.ts and
 * src/hover/HoverProvider.ts are the only places that turn an entry into
 * editor objects, and both read the fields below rather than keeping their
 * own copy of the prose.
 *
 * Provenance: every summary and example here was written for this project. Do
 * not paste text from the GNU ld manual (GFDL), which is not compatible with
 * this project's license; see AGENTS.md.
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
    /** Completion label and hover lookup key; unique across the registry. */
    readonly id: string;
    readonly kind: KeywordKind;
    /** Snippet text inserted when the item is accepted; hover derives the signature from it. */
    readonly snippet: string;
    /** One sentence used by both completion (item.documentation) and hover. */
    readonly summary: string;
    /** Short, authored usage example; hover renders it in a fenced block. */
    readonly example: string;
    /**
     * Optional hand-written signature for hover. Leave it out unless the form
     * derived from the snippet reads badly; when set it replaces the derived
     * form (see src/keywords/signature.ts).
     */
    readonly signature?: string;
    /** Scopes in which the keyword is offered. */
    readonly scopes: readonly KeywordScope[];
}

// Length caps for the hover content, enforced by src/test/unit/keywords.test.ts.
// Summaries must stay one sentence and examples a few lines, or the tooltip
// stops being readable.
export const SUMMARY_MAX_LENGTH = 160;
export const EXAMPLE_MAX_LENGTH = 200;
export const EXAMPLE_MAX_LINES = 4;

// Expression functions are legal wherever an expression is: top level,
// section descriptions, and section bodies. They are not offered inside
// MEMORY or VERSION, where expressions are rare and the item set is narrow.
const EXPRESSION_SCOPES: readonly KeywordScope[] = ['top', 'sections', 'section-body', 'overlay'];

// Commands legal both at top level and directly inside SECTIONS or an overlay
// section, but not in an output section body (see the spec scenario "Inside an
// output section body").
const TOP_AND_SECTIONS: readonly KeywordScope[] = ['top', 'sections', 'overlay'];

export const KEYWORDS: readonly KeywordEntry[] = [
    // ---------------------------------------------------------------- top level
    {
        id: 'ENTRY',
        kind: 'command',
        snippet: 'ENTRY(${1:symbol})',
        summary: 'Record a symbol as the entry point stored in the output file.',
        example: 'ENTRY(_start)',
        scopes: ['top']
    },
    {
        id: 'OUTPUT_FORMAT',
        kind: 'command',
        snippet: 'OUTPUT_FORMAT(${1:bfdname})',
        summary: 'Choose the object file format the linker writes, by its BFD name.',
        example: 'OUTPUT_FORMAT(elf64-x86-64)',
        scopes: ['top']
    },
    {
        id: 'OUTPUT_ARCH',
        kind: 'command',
        snippet: 'OUTPUT_ARCH(${1:bfdarch})',
        summary: 'Record the machine architecture of the output file.',
        example: 'OUTPUT_ARCH(i386:x86-64)',
        scopes: ['top']
    },
    {
        id: 'OUTPUT',
        kind: 'command',
        snippet: 'OUTPUT(${1:filename})',
        summary: 'Name the file the linker writes.',
        example: 'OUTPUT(build/app.elf)',
        scopes: ['top']
    },
    {
        id: 'INPUT',
        kind: 'command',
        snippet: 'INPUT(${1:file.o} ${2:file2.o})',
        summary: 'Add object files or archives to the link, in the order listed.',
        example: 'INPUT(crt0.o main.o ../lib/libc.a)',
        scopes: ['top']
    },
    {
        id: 'GROUP',
        kind: 'command',
        snippet: 'GROUP(${1:lib.a} ${2:lib2.a})',
        summary: 'List archives that the linker revisits after each pass, so a member needed only by a later reference is still loaded.',
        example: 'GROUP(libgcc.a libc.a)',
        scopes: ['top']
    },
    {
        id: 'SEARCH_DIR',
        kind: 'command',
        snippet: 'SEARCH_DIR(${1:path})',
        summary: 'Add a directory to the list searched for archives.',
        example: 'SEARCH_DIR(../lib); SEARCH_DIR(/usr/lib)',
        scopes: ['top']
    },
    {
        id: 'STARTUP',
        kind: 'command',
        snippet: 'STARTUP(${1:filename})',
        summary: 'Make the named file the first input file of the link.',
        example: 'STARTUP(crt0.o)',
        scopes: ['top']
    },
    {
        id: 'TARGET',
        kind: 'command',
        snippet: 'TARGET(${1:bfdname})',
        summary: 'Set the BFD target format that the linker uses for this link.',
        example: 'TARGET(elf32-littlearm)',
        scopes: ['top']
    },
    {
        id: 'ASSERT',
        kind: 'command',
        snippet: 'ASSERT(${1:expression}, ${2:message})',
        summary: 'Stop the link with a message when an expression evaluates to zero, at top level, in SECTIONS, or in an overlay.',
        example: 'ASSERT(SIZEOF(.text) > 0, "text is empty")\nSECTIONS { .data : { *(.data) } ASSERT(SIZEOF(.data) > 0, "no .data") }',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'EXTERN',
        kind: 'command',
        snippet: 'EXTERN(${1:symbol})',
        summary: 'Force a symbol into the output symbol table as an undefined symbol.',
        example: 'EXTERN(__libc_start_main)',
        scopes: ['top']
    },
    {
        id: 'INCLUDE',
        kind: 'command',
        snippet: 'INCLUDE ${1:filename}',
        summary: 'Read another linker script at this point, as if its text stood here.',
        example: 'INCLUDE common.lds',
        scopes: ['top']
    },
    {
        id: 'PROVIDE',
        kind: 'command',
        snippet: 'PROVIDE(${1:symbol} = ${2:expression})',
        summary: 'Create a symbol only when something needs it and nothing else defines it, at top level, in SECTIONS, or in an overlay.',
        example: 'PROVIDE(__stack_top = 0x20001000)\nSECTIONS { .text : { *(.text) } PROVIDE(_etext = .); }',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'PROVIDE_HIDDEN',
        kind: 'command',
        snippet: 'PROVIDE_HIDDEN(${1:symbol} = ${2:expression})',
        summary: 'Define a symbol the way PROVIDE does but keep it out of the dynamic symbol table, at top level, in SECTIONS, or in an overlay.',
        example: 'PROVIDE_HIDDEN(_end = .);',
        scopes: TOP_AND_SECTIONS
    },
    {
        id: 'INSERT',
        kind: 'command',
        snippet: 'INSERT ${1:AFTER} ${2:.text}',
        summary: 'Add the sections of this script before or after a section of the default script, when the default script is used through -T.',
        example: 'SECTIONS { .crc : { *(.crc) } } INSERT AFTER .text',
        scopes: ['top']
    },
    {
        id: 'FORCE_COMMON_ALLOCATION',
        kind: 'keyword',
        snippet: 'FORCE_COMMON_ALLOCATION',
        summary: 'Allocate common symbols even when the output format would not require it.',
        example: 'FORCE_COMMON_ALLOCATION',
        scopes: ['top']
    },
    {
        id: 'NOCROSSREFS',
        kind: 'command',
        snippet: 'NOCROSSREFS(${1:.text} ${2:.data})',
        summary: 'Report an error when any two sections named in the list refer to each other.',
        example: 'NOCROSSREFS(.text .rodata)',
        scopes: ['top']
    },
    {
        id: 'LD_FEATURE',
        kind: 'command',
        snippet: 'LD_FEATURE(${1:string})',
        summary: 'Ask the linker for a named feature, such as SANE_EXPR.',
        example: 'LD_FEATURE(SANE_EXPR)',
        scopes: ['top']
    },
    {
        id: 'REGION_ALIAS',
        kind: 'command',
        snippet: 'REGION_ALIAS(${1:alias}, ${2:region})',
        summary: 'Give a second name to a memory region so section attributes can refer to either name.',
        example: 'REGION_ALIAS("ROM", rom);\n_rom_base = ORIGIN(ROM);',
        scopes: ['top']
    },

    // ------------------------------------------------------------------- blocks
    {
        id: 'SECTIONS',
        kind: 'block',
        snippet: 'SECTIONS {\n\t${1}\n}',
        summary: 'Describe where output sections go: their order, addresses, and contents.',
        example: 'SECTIONS {\n    .text : { *(.text) }\n}',
        scopes: ['top']
    },
    {
        id: 'MEMORY',
        kind: 'block',
        snippet: 'MEMORY {\n\t${1}\n}',
        summary: 'Declare the memory regions available to the script, with their start addresses and sizes.',
        example: 'MEMORY {\n    ram (rwx) : ORIGIN = 0x20000000, LENGTH = 64K\n}',
        scopes: ['top']
    },
    {
        id: 'PHDRS',
        kind: 'block',
        snippet: 'PHDRS {\n\t${1}\n}',
        summary: 'Declare the program headers the link creates in the output file.',
        example: 'PHDRS {\n    text PT_LOAD;\n}',
        scopes: ['top']
    },
    {
        id: 'VERSION',
        kind: 'block',
        snippet: 'VERSION {\n\t${1:version-script-commands}\n}',
        summary: 'Declare the symbol version nodes and which symbols belong to them.',
        example: 'VERSION {\n    V1.0 { global: init; local: *; };\n}',
        scopes: ['top']
    },
    {
        id: 'OVERLAY',
        kind: 'block',
        snippet: 'OVERLAY ${1:address} : ${2:AT(load_address)} {\n\t${3}\n}',
        summary: 'Give several sections one run address while each keeps its own load address, inside SECTIONS.',
        example: 'OVERLAY 0x1000 : AT(0x8000) {\n    .one { *(.one) }\n}',
        scopes: ['sections']
    },

    // ------------------------------------------------- output section level items
    {
        id: 'KEEP',
        kind: 'command',
        snippet: 'KEEP(*(${1:.text}))',
        summary: 'Shield an input section from a garbage collection pass that would otherwise drop it, in SECTIONS, in an output section, or in an overlay.',
        example: '.text : { KEEP(*(.init)) }',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'SORT',
        kind: 'command',
        snippet: 'SORT(${1:.text*})',
        summary: 'Sort the matched input sections by name, in SECTIONS, in an output section, or in an overlay; the long spelling is SORT_BY_NAME.',
        example: '.text : { SORT(.text.*) }',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'SORT_BY_NAME',
        kind: 'command',
        snippet: 'SORT_BY_NAME(${1:.text*})',
        summary: 'Order the matched input sections alphabetically by their file names.',
        example: '.ctors : { SORT_BY_NAME(.ctors.*) }',
        scopes: ['section-body']
    },
    {
        id: 'SORT_BY_ALIGNMENT',
        kind: 'command',
        snippet: 'SORT_BY_ALIGNMENT(${1:.text*})',
        summary: 'Order the matched input sections by alignment, largest requirement first.',
        example: '.data : { SORT_BY_ALIGNMENT(.data.*) }',
        scopes: ['section-body']
    },
    {
        id: 'SORT_BY_INIT_PRIORITY',
        kind: 'command',
        snippet: 'SORT_BY_INIT_PRIORITY(${1:.init_array.*})',
        summary: 'Order the matched input sections by the priority encoded in their constructor names.',
        example: '.init_array : { SORT_BY_INIT_PRIORITY(.init_array.*) }',
        scopes: ['section-body']
    },
    {
        id: 'DISCARD',
        kind: 'keyword',
        snippet: '/DISCARD/ : { *(${1:.comment}) }',
        summary: 'Collect input sections that are to be left out of the output file, inside SECTIONS or an overlay.',
        example: '/DISCARD/ : { *(.comment) }',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'NOLOAD',
        kind: 'keyword',
        snippet: 'NOLOAD',
        summary: 'Reserve memory for an output section without giving it contents in the file, inside SECTIONS or an overlay.',
        example: '.noinit (NOLOAD) : { *(.noinit) }',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'DSECT',
        kind: 'keyword',
        snippet: 'DSECT',
        summary: 'Mark an output section as a dummy that occupies no space in the output file, inside SECTIONS or an overlay.',
        example: '.dummy DSECT : { *(.dummy) }',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'COPY',
        kind: 'keyword',
        snippet: 'COPY',
        summary: 'Mark an output section as neither allocated in memory nor loaded from the file, inside SECTIONS or an overlay.',
        example: '.info COPY : { *(.info) }',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'INFO',
        kind: 'keyword',
        snippet: 'INFO',
        summary: 'Mark an output section as loaded but not allocated in the memory image, inside SECTIONS or an overlay.',
        example: '.stabs INFO : { *(.stabs) }',
        scopes: ['sections', 'overlay']
    },
    {
        id: 'CREATE_OBJECT_SYMBOLS',
        kind: 'keyword',
        snippet: 'CREATE_OBJECT_SYMBOLS',
        summary: 'Create one symbol per input file whose contents reach the section, in SECTIONS, in an output section, or in an overlay.',
        example: '.text : { CREATE_OBJECT_SYMBOLS *(.text) }',
        scopes: ['sections', 'section-body', 'overlay']
    },
    {
        id: 'CONSTRUCTORS',
        kind: 'keyword',
        snippet: 'CONSTRUCTORS',
        summary: 'Emit the C++ constructor and destructor tables for the section, in SECTIONS, in an output section, or in an overlay.',
        example: '.ctors : { CONSTRUCTORS }',
        scopes: ['sections', 'section-body', 'overlay']
    },

    // -------------------------------------------------------- section body items
    {
        id: 'BYTE',
        kind: 'command',
        snippet: 'BYTE(${1:expression})',
        summary: 'Write one byte of the expression at the current location.',
        example: '.magic : { BYTE(0x7f) }',
        scopes: ['section-body']
    },
    {
        id: 'SHORT',
        kind: 'command',
        snippet: 'SHORT(${1:expression})',
        summary: 'Write a two-byte value at the current location.',
        example: '.hdr : { SHORT(0x0002) }',
        scopes: ['section-body']
    },
    {
        id: 'LONG',
        kind: 'command',
        snippet: 'LONG(${1:expression})',
        summary: 'Write a four-byte value at the current location.',
        example: '.hdr : { LONG(0x1000) }',
        scopes: ['section-body']
    },
    {
        id: 'QUAD',
        kind: 'command',
        snippet: 'QUAD(${1:expression})',
        summary: 'Write an eight-byte value at the current location.',
        example: '.hdr : { QUAD(0x1122334455667788) }',
        scopes: ['section-body']
    },
    {
        id: 'SQUAD',
        kind: 'command',
        snippet: 'SQUAD(${1:expression})',
        summary: 'Write a signed eight-byte value at the current location.',
        example: '.hdr : { SQUAD(-1) }',
        scopes: ['section-body']
    },
    {
        id: 'FILL',
        kind: 'command',
        snippet: 'FILL(${1:expression})',
        summary: 'Set the byte pattern used to pad gaps left in the section.',
        example: '.text : { FILL(0x9090) }',
        scopes: ['section-body']
    },
    {
        id: 'ALIGN',
        kind: 'function',
        snippet: 'ALIGN(${1:expression})',
        summary: 'Move the location counter to the next multiple of the expression, inside an output section or in an assignment at top level.',
        example: '.text : { . = ALIGN(8); *(.text) }\n_end = ALIGN(16);',
        scopes: ['top', 'section-body']
    },

    // ------------------------------------------------------------------- MEMORY
    {
        id: 'ORIGIN',
        kind: 'field',
        snippet: 'ORIGIN = ${1:expression}',
        summary: 'Give the start address of a memory region; org and o are accepted spellings.',
        example: 'rom (rx) : ORIGIN = 0x08000000, LENGTH = 512K',
        scopes: ['memory']
    },
    {
        id: 'LENGTH',
        kind: 'field',
        snippet: 'LENGTH = ${1:expression}',
        summary: 'Give the size of a memory region; len and l are accepted spellings.',
        example: 'ram (rwx) : ORIGIN = 0x20000000, LENGTH = 64K',
        scopes: ['memory']
    },
    // The optional (attr) list of a memory region, one item per documented
    // attribute so the letters are discoverable inside MEMORY.
    {
        id: 'R',
        kind: 'keyword',
        snippet: 'R',
        summary: 'Region attribute marking the region as holding read-only sections.',
        example: 'rom (rx) : ORIGIN = 0x0, LENGTH = 64K',
        scopes: ['memory']
    },
    {
        id: 'W',
        kind: 'keyword',
        snippet: 'W',
        summary: 'Region attribute marking the region as holding writable sections.',
        example: 'ram (rw) : ORIGIN = 0x20000000, LENGTH = 64K',
        scopes: ['memory']
    },
    {
        id: 'X',
        kind: 'keyword',
        snippet: 'X',
        summary: 'Region attribute marking the region as holding executable sections.',
        example: 'code (rx) : ORIGIN = 0x0, LENGTH = 128K',
        scopes: ['memory']
    },
    {
        id: 'A',
        kind: 'keyword',
        snippet: 'A',
        summary: 'Region attribute marking the region as holding allocated sections.',
        example: 'ram (arw) : ORIGIN = 0x20000000, LENGTH = 64K',
        scopes: ['memory']
    },
    {
        id: 'I',
        kind: 'keyword',
        snippet: 'I',
        summary: 'Region attribute marking the region as holding initialized sections.',
        example: 'rom (ri) : ORIGIN = 0x0, LENGTH = 64K',
        scopes: ['memory']
    },
    {
        id: 'L',
        kind: 'keyword',
        snippet: 'L',
        summary: 'Region attribute with the same meaning as I: initialized sections.',
        example: 'rom (rl) : ORIGIN = 0x0, LENGTH = 64K',
        scopes: ['memory']
    },
    {
        id: '!',
        kind: 'keyword',
        snippet: '!',
        summary: 'Region attribute that inverts the meaning of the attribute letters after it.',
        example: 'stack (!rx) : ORIGIN = 0x20000000, LENGTH = 4K',
        scopes: ['memory']
    },

    // -------------------------------------------------------------------- PHDRS
    {
        id: 'PT_NULL',
        kind: 'field',
        snippet: 'PT_NULL',
        summary: 'Program header type for a table entry that is not used.',
        example: 'PHDRS { pad PT_NULL; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_LOAD',
        kind: 'field',
        snippet: 'PT_LOAD',
        summary: 'Program header type for a segment that is loaded into memory.',
        example: 'PHDRS { text PT_LOAD; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_DYNAMIC',
        kind: 'field',
        snippet: 'PT_DYNAMIC',
        summary: 'Program header type for the segment holding dynamic linking information.',
        example: 'PHDRS { dyn PT_DYNAMIC; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_INTERP',
        kind: 'field',
        snippet: 'PT_INTERP',
        summary: 'Program header type for the segment naming the program interpreter.',
        example: 'PHDRS { interp PT_INTERP; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_NOTE',
        kind: 'field',
        snippet: 'PT_NOTE',
        summary: 'Program header type for a segment of note records.',
        example: 'PHDRS { note PT_NOTE; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_SHLIB',
        kind: 'field',
        snippet: 'PT_SHLIB',
        summary: 'Program header type reserved for shared library entries.',
        example: 'PHDRS { shlib PT_SHLIB; }',
        scopes: ['phdrs']
    },
    {
        id: 'PT_PHDR',
        kind: 'field',
        snippet: 'PT_PHDR',
        summary: 'Program header type for the segment that holds the header table itself.',
        example: 'PHDRS { headers PT_PHDR; }',
        scopes: ['phdrs']
    },

    // ----------------------------------------------------- expression functions
    {
        id: 'ABSOLUTE',
        kind: 'function',
        snippet: 'ABSOLUTE(${1:expression})',
        summary: 'Treat an expression as an absolute address, not one relative to a section, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_start = ABSOLUTE(0x8000);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'ADDR',
        kind: 'function',
        snippet: 'ADDR(${1:section})',
        summary: 'Return the virtual address of a named section, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_text = ADDR(.text);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'BLOCK',
        kind: 'function',
        snippet: 'BLOCK(${1:expression})',
        summary: 'Round the current position up to a multiple of the expression, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_data = BLOCK(16);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'DEFINED',
        kind: 'function',
        snippet: 'DEFINED(${1:symbol})',
        summary: 'Return one when the symbol already has a definition and zero when it has none, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_init = DEFINED(_init) ? _init : 0;',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'LOADADDR',
        kind: 'function',
        snippet: 'LOADADDR(${1:section})',
        summary: 'Return the load address of a named section, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_text_load = LOADADDR(.text);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'MAX',
        kind: 'function',
        snippet: 'MAX(${1:expression1}, ${2:expression2})',
        summary: 'Return the greater of two expressions, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_top = MAX(_end, 0x1000);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'MIN',
        kind: 'function',
        snippet: 'MIN(${1:expression1}, ${2:expression2})',
        summary: 'Return the lesser of two expressions, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_size = MIN(_end - _start, 4K);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'NEXT',
        kind: 'function',
        snippet: 'NEXT(${1:expression})',
        summary: 'Return the following address that meets the alignment of the section being built, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_after = NEXT(0x100);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'SIZEOF',
        kind: 'function',
        snippet: 'SIZEOF(${1:section})',
        summary: 'Report the total byte count of a named section, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '_text_size = SIZEOF(.text);',
        scopes: EXPRESSION_SCOPES
    },
    {
        id: 'SIZEOF_HEADERS',
        kind: 'field',
        snippet: 'SIZEOF_HEADERS',
        summary: 'Give the number of bytes the ELF program headers take, at top level, in SECTIONS, in an output section, or in an overlay.',
        example: '. = SIZEOF_HEADERS;',
        scopes: EXPRESSION_SCOPES
    },

    // ------------------------------------------------- version script commands
    {
        id: 'global',
        kind: 'keyword',
        snippet: 'global: ${1:symbol};',
        summary: 'Start the list of symbols a version node makes visible to programs linking against this library, inside VERSION.',
        example: 'V1.0 { global: init; };',
        scopes: ['version']
    },
    {
        id: 'local',
        kind: 'keyword',
        snippet: 'local: ${1:symbol};',
        summary: 'Start the list of symbols a version node keeps hidden from programs linking against this library, inside VERSION.',
        example: 'V1.0 { local: hidden; };',
        scopes: ['version']
    },
    {
        id: 'extern',
        kind: 'command',
        snippet: 'extern "${1:C++}" {\n\t${2:symbol};\n};',
        summary: 'Open a language block that changes how symbol names inside it are matched, inside VERSION.',
        example: 'V1.0 { extern "C++" { "foo()"; }; };',
        scopes: ['version']
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
