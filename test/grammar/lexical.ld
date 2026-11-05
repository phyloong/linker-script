// SYNTAX TEST "source.linker-script" "comments, strings and numbers"
/* block comment */
//<-- comment.block.ld punctuation.definition.comment.ld
//^^^^^^^^^^^^^^^ comment.block.ld
//               ^^ comment.block.ld punctuation.definition.comment.ld
/* multi
//<-- comment.block.ld punctuation.definition.comment.ld
//^^^^^^ comment.block.ld
   line comment */
//<---------------- comment.block.ld
//              ^^ comment.block.ld punctuation.definition.comment.ld
OUTPUT_FORMAT("elf64-x86-64")
//<------------- keyword.control.command.ld
//           ^ punctuation.section.parens.begin.ld
//            ^ string.quoted.double.ld punctuation.definition.string.begin.ld
//             ^^^^^^^^^^^^ string.quoted.double.ld
//                         ^ string.quoted.double.ld punctuation.definition.string.end.ld
//                          ^ punctuation.section.parens.end.ld
OUTPUT('build/app.elf')
//<------ keyword.control.command.ld
//    ^ punctuation.section.parens.begin.ld
//     ^ string.quoted.single.ld punctuation.definition.string.begin.ld
//      ^^^^^^^^^^^^^ string.quoted.single.ld
//                   ^ string.quoted.single.ld punctuation.definition.string.end.ld
//                    ^ punctuation.section.parens.end.ld
_start = 0x8000;
//<------ variable.other.symbol.ld
//     ^ keyword.operator.assignment.ld
//       ^^^^^^ constant.numeric.ld
//             ^ punctuation.terminator.statement.ld
_stack = 64K;
//<------ variable.other.symbol.ld
//     ^ keyword.operator.assignment.ld
//       ^^^ constant.numeric.ld
//          ^ punctuation.terminator.statement.ld
_heap = 1M;
//<----- variable.other.symbol.ld
//    ^ keyword.operator.assignment.ld
//      ^^ constant.numeric.ld
//        ^ punctuation.terminator.statement.ld
_octal = 010;
//<------ variable.other.symbol.ld
//     ^ keyword.operator.assignment.ld
//       ^^^ constant.numeric.ld
//          ^ punctuation.terminator.statement.ld
_decimal = 42;
//<-------- variable.other.symbol.ld
//       ^ keyword.operator.assignment.ld
//         ^^ constant.numeric.ld
//           ^ punctuation.terminator.statement.ld
_negative = -1;
//<--------- variable.other.symbol.ld
//        ^ keyword.operator.assignment.ld
//          ^^ constant.numeric.ld
//            ^ punctuation.terminator.statement.ld
