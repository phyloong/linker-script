// SYNTAX TEST "source.linker-script" "stray brace and unbalanced section body"
}
//<- punctuation.section.block.end.ld
ENTRY(_start)
//<----- keyword.control.command.ld
//   ^ punctuation.section.parens.begin.ld
//    ^^^^^^ - keyword.control.command.ld
//          ^ punctuation.section.parens.end.ld
SECTIONS
//<-------- keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    .text : {
//  ^^^^^ entity.name.section.ld
//        ^ punctuation.separator.colon.ld
//          ^ punctuation.section.block.begin.ld
        *(.text)
//      ^ keyword.operator.wildcard.ld
//       ^ punctuation.section.parens.begin.ld
//        ^^^^^ entity.name.section.input.ld
//             ^ punctuation.section.parens.end.ld
