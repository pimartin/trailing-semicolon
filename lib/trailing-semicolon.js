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
};

var TrailingSemicolon = self = {
   config: {
      ignoreEmptyLines: {
         type: 'boolean',
         default: true
      },
      startNewline: {
         type: 'boolean',
         default: false
      },
      moveEndOfLine: {
       type: 'boolean',
       default: false
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

   getConfig: function (config) {
      return atom.config.get('trailing-semicolon.'+ config);
   },

   subscriptions: null,

   activate: function () {
      self.subscriptions = new CompositeDisposable();
      self.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'trailing-semicolon:semicolon': function () {
               self['semicolon'].call(self);
            },
            'trailing-semicolon:comma': function () {
               self['comma'].call(self);
            },
            'trailing-semicolon:semicolon-newline': function () {
               self['semicolon-newline'].call(self);
            },
            'trailing-semicolon:comma-newline': function () {
               self['comma-newline'].call(self);
            },
            // Kept for backward compatibility, please don't use them:
            'trailing-semicolon:addSemicolon': function () {
               self['semicolon'].call(self);
            },
            'trailing-semicolon:addComma': function () {
               self['comma'].call(self);
            },
         })
      )
   },

   deactivate: function () {
      self.subscriptions.destroy();
   },

   semicolon: function () {
      self.applyTrailingCharacter(';', self.getConfig('startNewline'), self.getConfig('moveEndOfLine'));
   },

   comma: function () {
      self.applyTrailingCharacter(',', self.getConfig('startNewline'), self.getConfig('moveEndOfLine'));
   },

   'semicolon-newline': function () {
      self.applyTrailingCharacter(';', true);
   },

   'comma-newline': function () {
      self.applyTrailingCharacter(',', true);
   },

   applyTrailingCharacter: function (character, startNewline, moveEndOfLine) {
      var textEditor = atom.workspace.getActiveTextEditor();
      var checkpoint = textEditor.createCheckpoint();
      var counts = self.countCharacterAtEnd(character);
      var normalizedCount = counts.found / (counts.total || 0);
      self.forEachSelectedLine(
         function (lineNumber) {
            self.modifyEndOfLine(lineNumber, character, normalizedCount);
         }
      );
      if (startNewline) {
         textEditor.insertNewlineBelow();
      }
      if (moveEndOfLine) {
         for (cursor in textEditor.cursors) {
            textEditor.cursors[cursor].moveToEndOfLine();
         }
      }
      textEditor.groupChangesSinceCheckpoint(checkpoint);
   },

   countCharacterAtEnd: function(character) {
      var ignoreEmptyLines = self.getConfig('ignoreEmptyLines');
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
      var linesDone = [];
      var bufferRange;
      selections.forEach(function (selection) {
         bufferRange = selection.getBufferRange();
         for (var i = bufferRange.start.row; i <= bufferRange.end.row; i++) {
            if (linesDone.indexOf(i) === -1) {
               linesDone.push(i);
               callback(i);
            }
         }
      })
   },

   modifyEndOfLine: function (lineNumber, character, normalizedCount) {
      var textEditor = atom.workspace.getActiveTextEditor();
      var textBuffer = textEditor.getBuffer();
      var ignoreEmptyLines = self.getConfig('ignoreEmptyLines');
      var behaviorMixed = self.getConfig('behaviorMixed');
      var behaviorAll = self.getConfig('behaviorAll');
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
module.exports = TrailingSemicolon;
