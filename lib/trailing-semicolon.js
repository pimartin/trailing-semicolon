var Atom = require('atom');
var CompositeDisposable = Atom.CompositeDisposable;
var Point = Atom.Point;
var Range = Atom.Range;

// To change the UI text without changing too much of the code
var behaviorsMixed = {
   add: 'Add the character when missing',
   invert: 'Add the character when missing, delete it when present (invert)',
   delete: 'Delete the character when present',
   harmonize: 'Harmonize (most common wins)'
};
var behaviorsAll = {
   delete: 'Delete the character',
   nothing: 'Do nothing'
};
Object.values = function (obj) {
   // http://stackoverflow.com/a/16643074/3666853 (2015-06-02)
   return Object.keys(obj).map(
      function (name) {
         return obj[name];
      }
   );
}

var TrailingSemicolon = {
   config: {
      ignoreEmptyLines: {
         type: 'boolean',
         default: true
      },
      behaviorMixed: {
         title: 'When multiple lines are selected, if some end by the desired character and others don\'t',
         type: 'string',
         default: behaviorsMixed['add'],
         enum: Object.values(behaviorsMixed)
      },
      behaviorAll: {
         title: 'When all selected lines end by the desired character',
         type: 'string',
         default: behaviorsAll['delete'],
         enum: Object.values(behaviorsAll)
      }
   },

   subscriptions: null,

   activate: function () {
      self.subscriptions = new CompositeDisposable();
      self.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'trailing-semicolon:semicolon': function () {
               self.semicolon.call(self);
            },
            'trailing-semicolon:comma': function () {
               self.comma.call(self);
            },
            // Kept for backward compatibility, please don't use them:
            'trailing-semicolon:addSemicolon': function () {
               self.semicolon.call(self);
            },
            'trailing-semicolon:addComma': function () {
               self.comma.call(self);
            },
         })
      )
   },

   deactivate: function () {
      self.subscriptions.destroy();
   },

   semicolon: function () {
      self.trailingCharacter(';');
   },

   comma: function () {
      self.trailingCharacter(',');
   },

   trailingCharacter: function (character) {
      var textEditor = atom.workspace.getActiveTextEditor();
      var checkpoint = textEditor.createCheckpoint();
      var counts = self.countCharacterAtEnd(character);
      var normalizedCount = counts.found / (counts.total || 0);
      self.forEachSelectedLine(
         function (lineNumber) {
            self.modifyEndOfLine(lineNumber, character, normalizedCount);
         }
      );
      textEditor.groupChangesSinceCheckpoint(checkpoint);
   },

   countCharacterAtEnd: function(character) {
      var ignoreEmptyLines = atom.config.get('trailing-semicolon.ignoreEmptyLines');
      var found = 0;
      var total = 0;
      var lastCharacter;
      self.forEachSelectedLine(
         function (lineNumber) {
            lastCharacter = self.getLastCharacter(lineNumber);
            if (lastCharacter.position.column !== 0 || !ignoreEmptyLines) {
               if (lastCharacter.character === character) {
                  found++;
               }
               total++;
            }
         }
      );
      return { found: found, total: total };
   },

   forEachSelectedLine: function (callback) {
      var textEditor = atom.workspace.getActiveTextEditor();
      var textBuffer = textEditor.getBuffer();
      var selections = textEditor.getSelections();

      var bufferRange;
      selections.forEach(function (selection) {
         bufferRange = selection.getBufferRange();
         for (var i = bufferRange.start.row; i <= bufferRange.end.row; i++) {
            callback(i);
         }
      })
   },

   modifyEndOfLine: function (lineNumber, character, normalizedCount) {
      var textEditor = atom.workspace.getActiveTextEditor();
      var textBuffer = textEditor.getBuffer();
      var ignoreEmptyLines = atom.config.get('trailing-semicolon.ignoreEmptyLines');
      var behaviorMixed = atom.config.get('trailing-semicolon.behaviorMixed');
      var behaviorAll = atom.config.get('trailing-semicolon.behaviorAll');
      var lastCharacter = self.getLastCharacter(lineNumber);

      if (lastCharacter.position.column === 0 && ignoreEmptyLines) {
         return;
      }
      if (normalizedCount === 0) {
         self.setCharacterAt(character, lastCharacter.position);
      } else if (normalizedCount === 1 && behaviorAll === behaviorsAll['delete']) {
         self.deleteCharacterAt(lastCharacter.position);
      } else if (behaviorMixed === behaviorsMixed['invert']) {
         if (lastCharacter.character !== character) {
            self.setCharacterAt(character, lastCharacter.position);
         } else {
            self.deleteCharacterAt(lastCharacter.position);
         }
      } else if (behaviorMixed === behaviorsMixed['add']
         || (normalizedCount >= 0.5 && behaviorMixed === behaviorsMixed['harmonize'])
      ) {
         if (lastCharacter.character !== character) {
            self.setCharacterAt(character, lastCharacter.position);
         }
      } else { // if (behavior=harmonize and more missing than present) or behavior=delete
         if (lastCharacter.character === character) {
            self.deleteCharacterAt(lastCharacter.position);
         }
      }
   },

   deleteCharacterAt: function (position) {
      self.setCharacterAt('', position.translate([0,-1]), position);
   },

   setCharacterAt: function (character, point1, point2) {
      var textEditor = atom.workspace.getActiveTextEditor();
      textEditor.setTextInBufferRange(new Range(
         point1,
         (point2 !== undefined) ? point2 : point1
      ), character);
   },

   getLastCharacter : function (lineNumber) {
      var lastPosition, lastCharacter;
      var textEditor = atom.workspace.getActiveTextEditor();
      var textBuffer = textEditor.getBuffer();
      var lastPosition = new Point(lineNumber, textBuffer.lineLengthForRow(lineNumber));
      var lastCharacter = textEditor.getTextInBufferRange(new Range(
         lastPosition.translate([0, -1]),
         lastPosition
      ));
      while ((/\s/).test(lastCharacter)) {
         lastPosition = lastPosition.translate([0, -1]);
         lastCharacter = textEditor.getTextInBufferRange(new Range(
            lastPosition.translate([0, -1]),
            lastPosition
         ));
      }
      return {
         position: lastPosition,
         character: lastCharacter
      };
   }
};
var self = TrailingSemicolon;
module.exports = TrailingSemicolon;
