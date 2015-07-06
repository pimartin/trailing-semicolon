# trailing-semicolon

## Description
Add (or remove) a semicolon (or a comma) at the end of the line.

## Features
* Key bindings (default to `ctrl-;` and `ctrl-,`)
* Context menu in the editor (`Trailing...`)
* Multiple cursors, multiple lines
* Ignore empty lines (optional)
* Start a new line (optional with default commands, always with `trailing-semicolon:semicolon-newline` and `trailing-semicolon:comma-newline`)

## How to use
Press  `ctrl-;` or `ctrl+,` to add/remove a semicolon at the end of the selected lines. The context menu can also be used in the editor, see the `"Trailing..."` sub-menu.

Two commands aren't binded to any keys by default : `trailing-semicolon:semicolon-newline` and `trailing-semicolon:comma-newline`. They have the same behavior as the default commands but also start a new line (exactly as `ctrl-enter` would do).

## Known issues
* The key bindings conflict with default configuration, you can change this in your `keymap.cson` file using `trailing-semicolon:semicolon` and `trailing-semicolon:comma` commands (or `application:show-settings`).
