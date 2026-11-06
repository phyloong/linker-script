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
    V3.0 {
//  ^^^^ entity.name.tag.version.ld
//       ^ punctuation.section.block.begin.ld
        global: bar;
//      ^^^^^^ keyword.other.version.ld
//            ^ punctuation.separator.colon.ld
//              ^^^ entity.name.symbol.ld
//                 ^ punctuation.terminator.statement.ld
        extern "C++" {
//      ^^^^^^ keyword.other.version.ld
//             ^^^^^ string.quoted.double.ld
//                   ^ punctuation.section.block.begin.ld
            "foo()";
//          ^^^^^^^ string.quoted.double.ld
//                 ^ punctuation.terminator.statement.ld
            baz;
//          ^^^ entity.name.symbol.ld
//             ^ punctuation.terminator.statement.ld
        };
//      ^ punctuation.section.block.end.ld
//       ^ punctuation.terminator.statement.ld
        local: *;
//      ^^^^^ keyword.other.version.ld
//           ^ punctuation.separator.colon.ld
//             ^ keyword.operator.wildcard.ld
//              ^ punctuation.terminator.statement.ld
    };
//  ^ punctuation.section.block.end.ld
//   ^ punctuation.terminator.statement.ld
    V2.0 { } V1.0;
//  ^^^^ entity.name.tag.version.ld
//       ^ punctuation.section.block.begin.ld
//         ^ punctuation.section.block.end.ld
//           ^^^^ entity.name.tag.version.ld
//               ^ punctuation.terminator.statement.ld
}
//<- punctuation.section.block.end.ld
