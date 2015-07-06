## 1.1.0
Features:
* Start a new line (optional with default commands, always with `trailing-semicolon:semicolon-newline` and `trailing-semicolon:comma-newline`)

Bugfixes:
* Now ignores multiple selections on the same line (after the first one)

## 1.0.0
Features:
* Works on selections spanning over multiple lines
* Ignores empty lines
* New settings

Bugfixes:
* Changes on multiple lines can be undone in one go

NOTE: If you had personal keymaps for this package, you should change the commands to "trailing-semicolon:semicolon" and "trailing-semicolon:comma". The old names have been kept for backward compatibility, but will eventually be removed.

## 0.1.1
Bugfixes:
* Doesn't add a semicolon/comma if one is already at the end of the line

## 0.1.0 - First Release
* Adds a semicolon to the end of the line
* Adds a comma to the end of the line
* Works with multiple cursors
