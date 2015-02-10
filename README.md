# trailing-semicolon

## Description
Inserts a semicolon (or a comma) at the end of the line and brings the cursor back to its previous position.

## Features
* Keymapping (default to `ctrl-;` and `ctrl-,`)
* Context menu in the editor (`Add trailing...`)
* Multiple cursors

## How to use
Press  `ctrl-;` or `ctrl+,` to add a semicolon at the end of the line where the cursor is placed. The context menu can also be used in the editor, see the `"Add trailing..."` sub-menu.

## Known issues
* The keymapping conflicts with default one, you can change one of the two in your `keymap.cson` file using `trailing-semicolon:addSemicolon` and `trailing-semicolon:addComma` commands.
* When multiple lines are selected with the same cursor, only one semicolon/comma is added for this cursor.
