// SYNTAX TEST "source.linker-script" "PHDRS block"
PHDRS
//<----- keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    headers PT_PHDR PHDRS;
//  ^^^^^^^ entity.name.tag.phdr.ld
//          ^^^^^^^ support.type.program-header.ld
//                  ^^^^^ keyword.other.phdr-flag.ld
//                       ^ punctuation.terminator.statement.ld
    text PT_LOAD FILEHDR PHDRS FLAGS(5);
//  ^^^^ entity.name.tag.phdr.ld
//       ^^^^^^^ support.type.program-header.ld
//               ^^^^^^^ keyword.other.phdr-flag.ld
//                       ^^^^^ keyword.other.phdr-flag.ld
//                             ^^^^^ keyword.control.command.ld
//                                  ^ punctuation.section.parens.begin.ld
//                                   ^ constant.numeric.ld
//                                    ^ punctuation.section.parens.end.ld
//                                     ^ punctuation.terminator.statement.ld
    data PT_LOAD FLAGS(6);
//  ^^^^ entity.name.tag.phdr.ld
//       ^^^^^^^ support.type.program-header.ld
//               ^^^^^ keyword.control.command.ld
//                    ^ punctuation.section.parens.begin.ld
//                     ^ constant.numeric.ld
//                      ^ punctuation.section.parens.end.ld
//                       ^ punctuation.terminator.statement.ld
    note PT_NOTE;
//  ^^^^ entity.name.tag.phdr.ld
//       ^^^^^^^ support.type.program-header.ld
//              ^ punctuation.terminator.statement.ld
    dyn PT_DYNAMIC;
//  ^^^ entity.name.tag.phdr.ld
//      ^^^^^^^^^^ support.type.program-header.ld
//                ^ punctuation.terminator.statement.ld
    interp PT_INTERP;
//  ^^^^^^ entity.name.tag.phdr.ld
//         ^^^^^^^^^ support.type.program-header.ld
//                  ^ punctuation.terminator.statement.ld
    shlib PT_SHLIB;
//  ^^^^^ entity.name.tag.phdr.ld
//        ^^^^^^^^ support.type.program-header.ld
//                ^ punctuation.terminator.statement.ld
    unused PT_NULL;
//  ^^^^^^ entity.name.tag.phdr.ld
//         ^^^^^^^ support.type.program-header.ld
//                ^ punctuation.terminator.statement.ld
    tls PT_TLS;
//  ^^^ entity.name.tag.phdr.ld
//      ^^^^^^ support.type.program-header.ld
//            ^ punctuation.terminator.statement.ld
    stack PT_GNU_STACK;
//  ^^^^^ entity.name.tag.phdr.ld
//        ^^^^^^^^^^^^ support.type.program-header.ld
//                    ^ punctuation.terminator.statement.ld
    relro PT_GNU_RELRO;
//  ^^^^^ entity.name.tag.phdr.ld
//        ^^^^^^^^^^^^ support.type.program-header.ld
//                    ^ punctuation.terminator.statement.ld
    eh_frame PT_GNU_EH_FRAME;
//  ^^^^^^^^ entity.name.tag.phdr.ld
//           ^^^^^^^^^^^^^^^ support.type.program-header.ld
//                          ^ punctuation.terminator.statement.ld
    load_at PT_LOAD AT(0x8000);
//  ^^^^^^^ entity.name.tag.phdr.ld
//          ^^^^^^^ support.type.program-header.ld
//                  ^^ keyword.control.command.ld
//                    ^ punctuation.section.parens.begin.ld
//                     ^^^^^^ constant.numeric.ld
//                           ^ punctuation.section.parens.end.ld
//                            ^ punctuation.terminator.statement.ld
}
//<- punctuation.section.block.end.ld
