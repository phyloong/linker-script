// SYNTAX TEST "source.linker-script" "unterminated comment"
/* unterminated comment
//<-- comment.block.ld punctuation.definition.comment.ld
//^^^^^^^^^^^^^^^^^^^^^ comment.block.ld
ENTRY(_start)
//<------------- comment.block.ld
