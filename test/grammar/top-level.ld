// SYNTAX TEST "source.linker-script" "top-level commands and their arguments"
ENTRY(_start)
//<----- keyword.control.command.ld
//   ^ punctuation.section.parens.begin.ld
//    ^^^^^^ - keyword.control.command.ld
//          ^ punctuation.section.parens.end.ld
OUTPUT_FORMAT(elf64-x86-64)
//<------------- keyword.control.command.ld
//           ^ punctuation.section.parens.begin.ld
//            ^^^^^^^^^^^^ - keyword.control.command.ld
//                        ^ punctuation.section.parens.end.ld
OUTPUT_ARCH(i386:x86-64)
//<----------- keyword.control.command.ld
//         ^ punctuation.section.parens.begin.ld
//          ^^^^ - keyword.control.command.ld
//              ^ punctuation.separator.colon.ld
//               ^^^^^^ - keyword.control.command.ld
//                     ^ punctuation.section.parens.end.ld
OUTPUT(build/app.elf)
//<------ keyword.control.command.ld
//    ^ punctuation.section.parens.begin.ld
//     ^^^^^^^^^^^^^ - keyword.control.command.ld
//                  ^ punctuation.section.parens.end.ld
INPUT(crt0.o)
//<----- keyword.control.command.ld
//   ^ punctuation.section.parens.begin.ld
//    ^^^^^^ - keyword.control.command.ld
//          ^ punctuation.section.parens.end.ld
GROUP(libgcc.a libc.a)
//<----- keyword.control.command.ld
//   ^ punctuation.section.parens.begin.ld
//    ^^^^^^^^^^^^^^^ - keyword.control.command.ld
//                   ^ punctuation.section.parens.end.ld
SEARCH_DIR(../lib)
//<---------- keyword.control.command.ld
//        ^ punctuation.section.parens.begin.ld
//         ^^^^^^ - keyword.control.command.ld
//               ^ punctuation.section.parens.end.ld
STARTUP(crt0.o)
//<------- keyword.control.command.ld
//     ^ punctuation.section.parens.begin.ld
//      ^^^^^^ - keyword.control.command.ld
//            ^ punctuation.section.parens.end.ld
TARGET(elf32-littlearm)
//<------ keyword.control.command.ld
//    ^ punctuation.section.parens.begin.ld
//     ^^^^^^^^^^^^^^^ - keyword.control.command.ld
//                    ^ punctuation.section.parens.end.ld
EXTERN(__libc_start_main)
//<------ keyword.control.command.ld
//    ^ punctuation.section.parens.begin.ld
//     ^^^^^^^^^^^^^^^^^ - keyword.control.command.ld
//                      ^ punctuation.section.parens.end.ld
INCLUDE common.lds
//<------- keyword.control.command.ld
//     ^^^^^^^^^^^ - keyword.control.command.ld
INSERT AFTER .text
//<------ keyword.control.command.ld
//    ^^^^^^^ - keyword.control.command.ld
//           ^^^^^ entity.name.section.input.ld
NOCROSSREFS(.text .rodata)
//<----------- keyword.control.command.ld
//         ^ punctuation.section.parens.begin.ld
//          ^^^^^ entity.name.section.input.ld
//                ^^^^^^^ entity.name.section.input.ld
//                       ^ punctuation.section.parens.end.ld
LD_FEATURE(SANE_EXPR)
//<---------- keyword.control.command.ld
//        ^ punctuation.section.parens.begin.ld
//         ^^^^^^^^^ - keyword.control.command.ld
//                  ^ punctuation.section.parens.end.ld
REGION_ALIAS("ROM", rom)
//<------------ keyword.control.command.ld
//          ^ punctuation.section.parens.begin.ld
//           ^ string.quoted.double.ld punctuation.definition.string.begin.ld
//            ^^^ string.quoted.double.ld
//               ^ string.quoted.double.ld punctuation.definition.string.end.ld
//                ^ punctuation.separator.comma.ld
//                 ^^^^ - keyword.control.command.ld
//                     ^ punctuation.section.parens.end.ld
FORCE_COMMON_ALLOCATION
//<----------------------- keyword.other.ld
PROVIDE(__stack_top = 0x20001000);
//<------- keyword.control.command.ld
//     ^ punctuation.section.parens.begin.ld
//      ^^^^^^^^^^^ variable.other.symbol.ld
//                  ^ keyword.operator.assignment.ld
//                    ^^^^^^^^^^ constant.numeric.ld
//                              ^ punctuation.section.parens.end.ld
//                               ^ punctuation.terminator.statement.ld
ASSERT(SIZEOF(.text) > 0, "text is empty")
//<------ keyword.control.command.ld
//    ^ punctuation.section.parens.begin.ld
//     ^^^^^^ support.function.ld
//           ^ punctuation.section.parens.begin.ld
//            ^^^^^ entity.name.section.input.ld
//                 ^ punctuation.section.parens.end.ld
//                   ^ keyword.operator.ld
//                     ^ constant.numeric.ld
//                      ^ punctuation.separator.comma.ld
//                        ^ string.quoted.double.ld punctuation.definition.string.begin.ld
//                         ^^^^^^^^^^^^^ string.quoted.double.ld
//                                      ^ string.quoted.double.ld punctuation.definition.string.end.ld
//                                       ^ punctuation.section.parens.end.ld
