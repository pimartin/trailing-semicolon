# trailing-semicolon

## Description
Add (or remove) a semicolon (or a comma) at the end of the line.

## Features
* Keymapping (default to `ctrl-;` and `ctrl-,`)
* Context menu in the editor (`Trailing...`)
* Multiple cursors, multiple lines
* Ignore empty lines

## How to use
Press  `ctrl-;` or `ctrl+,` to add/remove a semicolon at the end of the selected lines. The context menu can also be used in the editor, see the `"Trailing..."` sub-menu.

## Known issues
* The keymaps conflict with default configuration, you can change one of the two in your `keymap.cson` file using `trailing-semicolon:semicolon` and `trailing-semicolon:comma` commands.
