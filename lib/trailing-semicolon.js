var CompositeDisposable = require('atom').CompositeDisposable

var TrailingSemicolon = module.exports = {
   subscriptions: null,

   activate: function () {
      var that = this;
      this.subscriptions = new CompositeDisposable()
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'trailing-semicolon:addSemicolon': function () {
               that.addSemicolon.call(that)
            },
            'trailing-semicolon:addComma': function () {
               that.addComma.call(that)
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

      var oldPositions = {}
      cursors.forEach(function (cursor) {
         oldPositions[cursor.id] = cursor.getScreenPosition()
         cursor.moveToEndOfLine()
      })

      textEditor.insertText(character)

      cursors.forEach(function (cursor) {
         cursor.setScreenPosition(oldPositions[cursor.id])
      })
   },

   deactivate: function () {
      this.subscriptions.destroy()
   }

}
