var CompositeDisposable = require('atom').CompositeDisposable
var Point = require('atom').Point
var Range = require('atom').Range

var TrailingSemicolon = module.exports = {
   subscriptions: null,

   activate: function () {
      var self = this;
      this.subscriptions = new CompositeDisposable()
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'trailing-semicolon:addSemicolon': function () {
               self.addSemicolon.call(self)
            },
            'trailing-semicolon:addComma': function () {
               self.addComma.call(self)
            },
         })
      )
   },

   addSemicolon: function () {
      this.addTrailingCharacter(';')
   },

   addComma: function () {
      this.addTrailingCharacter(',')
   },

   addTrailingCharacter: function (character) {
      var textEditor = atom.workspace.getActiveTextEditor()
      var cursors = textEditor.getCursors()

      var oldPosition, lastCharBufferRange, lastChar
      cursors.forEach(function (cursor) {
         oldPosition = cursor.getScreenPosition()
         cursor.moveToEndOfLine()
         lastCharBufferRange = new Range(
            cursor.getBufferPosition().translate([0, -1]),
            cursor.getBufferPosition()
         )
         lastChar = textEditor.getTextInBufferRange(lastCharBufferRange)
         if (lastChar !== character) {
            textEditor.setTextInBufferRange(new Range(
               cursor.getBufferPosition(),
               cursor.getBufferPosition()
            ), character)
         }
         cursor.setScreenPosition(oldPosition)
      })
   },

   deactivate: function () {
      this.subscriptions.destroy()
   }

}
