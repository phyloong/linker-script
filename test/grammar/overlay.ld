// SYNTAX TEST "source.linker-script" "OVERLAY block"
SECTIONS
//<-------- keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    OVERLAY 0x1000 : AT(0x8000)
//  ^^^^^^^ keyword.control.block.ld
//          ^^^^^^ constant.numeric.ld
//                 ^ punctuation.separator.colon.ld
//                   ^^ keyword.operator.region-marker.ld
//                     ^ punctuation.section.parens.begin.ld
//                      ^^^^^^ constant.numeric.ld
//                            ^ punctuation.section.parens.end.ld
    {
//  ^ punctuation.section.block.begin.ld
        .one { *(.one) }
//      ^^^^ entity.name.section.ld
//           ^ punctuation.section.block.begin.ld
//             ^ keyword.operator.wildcard.ld
//              ^ punctuation.section.parens.begin.ld
//               ^^^^ entity.name.section.input.ld
//                   ^ punctuation.section.parens.end.ld
//                     ^ punctuation.section.block.end.ld
        .two { *(.two) }
//      ^^^^ entity.name.section.ld
//           ^ punctuation.section.block.begin.ld
//             ^ keyword.operator.wildcard.ld
//              ^ punctuation.section.parens.begin.ld
//               ^^^^ entity.name.section.input.ld
//                   ^ punctuation.section.parens.end.ld
//                     ^ punctuation.section.block.end.ld
    } > RAM
//  ^ punctuation.section.block.end.ld
//    ^ keyword.operator.region-marker.ld
//      ^^^ entity.name.tag.region.ld
    _ov_end = .;
//  ^^^^^^^ variable.other.symbol.ld
//          ^ keyword.operator.assignment.ld
//            ^ variable.other.location-counter.ld
//             ^ punctuation.terminator.statement.ld
}
//<- punctuation.section.block.end.ld
