// SYNTAX TEST "source.linker-script" "MEMORY block"
MEMORY
//<------ keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    FLASH (rx)   : ORIGIN = 0x08000000, LENGTH = 512K
//  ^^^^^ entity.name.tag.region.ld
//        ^ meta.attributes.region.ld punctuation.section.parens.begin.ld
//         ^^ meta.attributes.region.ld keyword.other.region-attribute.ld
//           ^ meta.attributes.region.ld punctuation.section.parens.end.ld
//               ^ punctuation.separator.colon.ld
//                 ^^^^^^ keyword.other.region-field.ld
//                        ^ keyword.operator.assignment.ld
//                          ^^^^^^^^^^ constant.numeric.ld
//                                    ^ punctuation.separator.comma.ld
//                                      ^^^^^^ keyword.other.region-field.ld
//                                             ^ keyword.operator.assignment.ld
//                                               ^^^^ constant.numeric.ld
    RAM   (!rwx) : org = 0x20000000, len = 64K
//  ^^^ entity.name.tag.region.ld
//        ^ meta.attributes.region.ld punctuation.section.parens.begin.ld
//         ^ meta.attributes.region.ld keyword.operator.exclusion.ld
//          ^^^ meta.attributes.region.ld keyword.other.region-attribute.ld
//             ^ meta.attributes.region.ld punctuation.section.parens.end.ld
//               ^ punctuation.separator.colon.ld
//                 ^^^ keyword.other.region-field.ld
//                     ^ keyword.operator.assignment.ld
//                       ^^^^^^^^^^ constant.numeric.ld
//                                 ^ punctuation.separator.comma.ld
//                                   ^^^ keyword.other.region-field.ld
//                                       ^ keyword.operator.assignment.ld
//                                         ^^^ constant.numeric.ld
}
//<- punctuation.section.block.end.ld
