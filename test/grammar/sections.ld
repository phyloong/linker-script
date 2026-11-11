// SYNTAX TEST "source.linker-script" "SECTIONS block"
SECTIONS
//<-------- keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    .text : { *(.text* !.text.boot) } > FLASH AT > ROM
//  ^^^^^ entity.name.section.ld
//        ^ punctuation.separator.colon.ld
//          ^ punctuation.section.block.begin.ld
//            ^ keyword.operator.wildcard.ld
//             ^ punctuation.section.parens.begin.ld
//              ^^^^^^ entity.name.section.input.ld
//                     ^ keyword.operator.exclusion.ld
//                      ^^^^^^^^^^ entity.name.section.input.ld
//                                ^ punctuation.section.parens.end.ld
//                                  ^ punctuation.section.block.end.ld
//                                    ^ keyword.operator.region-marker.ld
//                                      ^^^^^ entity.name.tag.region.ld
//                                            ^^ keyword.operator.region-marker.ld
//                                               ^ keyword.operator.region-marker.ld
//                                                 ^^^ entity.name.tag.region.ld
    .data :
//  ^^^^^ entity.name.section.ld
//        ^ punctuation.separator.colon.ld
    {
//  ^ punctuation.section.block.begin.ld
        . = ALIGN(8);
//      ^ variable.other.location-counter.ld
//        ^ keyword.operator.assignment.ld
//          ^^^^^ support.function.ld
//               ^ punctuation.section.parens.begin.ld
//                ^ constant.numeric.ld
//                 ^ punctuation.section.parens.end.ld
//                  ^ punctuation.terminator.statement.ld
        KEEP(*(.init))
//      ^^^^ keyword.control.command.ld
//          ^ punctuation.section.parens.begin.ld
//           ^ keyword.operator.wildcard.ld
//            ^ punctuation.section.parens.begin.ld
//             ^^^^^ entity.name.section.input.ld
//                  ^ punctuation.section.parens.end.ld
//                   ^ punctuation.section.parens.end.ld
        SORT_BY_NAME(.ctors.*)
//      ^^^^^^^^^^^^ keyword.control.command.ld
//                  ^ punctuation.section.parens.begin.ld
//                   ^^^^^^^^ entity.name.section.input.ld
//                           ^ punctuation.section.parens.end.ld
        SORT_NONE(.ctors.*)
//      ^^^^^^^^^ keyword.control.command.ld
//               ^ punctuation.section.parens.begin.ld
//                ^^^^^^^^ entity.name.section.input.ld
//                        ^ punctuation.section.parens.end.ld
        *(EXCLUDE_FILE(foo.o) .text*)
//      ^ keyword.operator.wildcard.ld
//       ^ punctuation.section.parens.begin.ld
//        ^^^^^^^^^^^^ keyword.control.command.ld
//                    ^ punctuation.section.parens.begin.ld
//                     ^^^^^ - entity.name.section.input.ld
//                          ^ punctuation.section.parens.end.ld
//                            ^^^^^^ entity.name.section.input.ld
//                                  ^ punctuation.section.parens.end.ld
        _max = CONSTANT(MAXPAGESIZE);
//      ^^^^ variable.other.symbol.ld
//           ^ keyword.operator.assignment.ld
//             ^^^^^^^^ support.function.ld
//                     ^ punctuation.section.parens.begin.ld
//                      ^^^^^^^^^^^ - support.function.ld
//                                 ^ punctuation.section.parens.end.ld
//                                  ^ punctuation.terminator.statement.ld
        BYTE(0x7f)
//      ^^^^ keyword.control.command.ld
//          ^ punctuation.section.parens.begin.ld
//           ^^^^ constant.numeric.ld
//               ^ punctuation.section.parens.end.ld
        LONG(_start)
//      ^^^^ keyword.control.command.ld
//          ^ punctuation.section.parens.begin.ld
//           ^^^^^^ - keyword.control.command.ld
//                 ^ punctuation.section.parens.end.ld
        FILL(0x9090)
//      ^^^^ keyword.control.command.ld
//          ^ punctuation.section.parens.begin.ld
//           ^^^^^^ constant.numeric.ld
//                 ^ punctuation.section.parens.end.ld
        __edata = .;
//      ^^^^^^^ variable.other.symbol.ld
//              ^ keyword.operator.assignment.ld
//                ^ variable.other.location-counter.ld
//                 ^ punctuation.terminator.statement.ld
    }
//  ^ punctuation.section.block.end.ld
    .bss (NOLOAD) : { *(.bss COMMON) }
//  ^^^^ entity.name.section.ld
//       ^ punctuation.section.parens.begin.ld
//        ^^^^^^ keyword.other.ld
//              ^ punctuation.section.parens.end.ld
//                ^ punctuation.separator.colon.ld
//                  ^ punctuation.section.block.begin.ld
//                    ^ keyword.operator.wildcard.ld
//                     ^ punctuation.section.parens.begin.ld
//                      ^^^^ entity.name.section.input.ld
//                           ^^^^^^ entity.name.section.input.ld
//                                 ^ punctuation.section.parens.end.ld
//                                   ^ punctuation.section.block.end.ld
    /DISCARD/ : { *(.comment) }
//  ^^^^^^^^^ entity.name.section.ld
//            ^ punctuation.separator.colon.ld
//              ^ punctuation.section.block.begin.ld
//                ^ keyword.operator.wildcard.ld
//                 ^ punctuation.section.parens.begin.ld
//                  ^^^^^^^^ entity.name.section.input.ld
//                          ^ punctuation.section.parens.end.ld
//                            ^ punctuation.section.block.end.ld
    __data_start = DATA_SEGMENT_ALIGN(0x1000, 0x1000);
//  ^^^^^^^^^^^^ variable.other.symbol.ld
//               ^ keyword.operator.assignment.ld
//                 ^^^^^^^^^^^^^^^^^^ support.function.ld
//                                   ^ punctuation.section.parens.begin.ld
//                                    ^^^^^^ constant.numeric.ld
//                                          ^ punctuation.separator.comma.ld
//                                            ^^^^^^ constant.numeric.ld
//                                                  ^ punctuation.section.parens.end.ld
//                                                   ^ punctuation.terminator.statement.ld
    PROVIDE(_etext = .);
//  ^^^^^^^ keyword.control.command.ld
//         ^ punctuation.section.parens.begin.ld
//          ^^^^^^ variable.other.symbol.ld
//                 ^ keyword.operator.assignment.ld
//                   ^ variable.other.location-counter.ld
//                    ^ punctuation.section.parens.end.ld
//                     ^ punctuation.terminator.statement.ld
}
//<- punctuation.section.block.end.ld
