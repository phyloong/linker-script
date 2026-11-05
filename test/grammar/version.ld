// SYNTAX TEST "source.linker-script" "VERSION block"
VERSION
//<------- keyword.control.block.ld
{
//<- punctuation.section.block.begin.ld
    V1.0 {
//  ^^^^ entity.name.tag.version.ld
//       ^ punctuation.section.block.begin.ld
        global: init; fini;
//      ^^^^^^ keyword.other.version.ld
//            ^ punctuation.separator.colon.ld
//              ^^^^ entity.name.symbol.ld
//                  ^ punctuation.terminator.statement.ld
//                    ^^^^ entity.name.symbol.ld
//                        ^ punctuation.terminator.statement.ld
        local: *;
//      ^^^^^ keyword.other.version.ld
//           ^ punctuation.separator.colon.ld
//             ^ keyword.operator.wildcard.ld
//              ^ punctuation.terminator.statement.ld
    };
//  ^ punctuation.section.block.end.ld
//   ^ punctuation.terminator.statement.ld
}
//<- punctuation.section.block.end.ld
