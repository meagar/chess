'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bishop = function (_Piece) {
  _inherits(Bishop, _Piece);

  function Bishop() {
    _classCallCheck(this, Bishop);

    return _possibleConstructorReturn(this, (Bishop.__proto__ || Object.getPrototypeOf(Bishop)).apply(this, arguments));
  }

  _createClass(Bishop, [{
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      return Rook.prototype.getSlideMoves.call(this, space, board, Bishop.deltas());
    }
  }], [{
    key: 'deltas',
    value: function deltas() {
      return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    }
  }]);

  return Bishop;
}(_piece2.default);

exports.default = Bishop;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

var _pawn = require('./pawn');

var _pawn2 = _interopRequireDefault(_pawn);

var _rook = require('./rook');

var _rook2 = _interopRequireDefault(_rook);

var _knight = require('./knight');

var _knight2 = _interopRequireDefault(_knight);

var _bishop = require('./bishop');

var _bishop2 = _interopRequireDefault(_bishop);

var _queen = require('./queen');

var _queen2 = _interopRequireDefault(_queen);

var _king = require('./king');

var _king2 = _interopRequireDefault(_king);

var _space = require('./space');

var _space2 = _interopRequireDefault(_space);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function buildPiece(ch) {
  var classMap = {
    p: _pawn2.default, r: _rook2.default, n: _knight2.default, b: _bishop2.default, q: _queen2.default, k: _king2.default
  };

  return new classMap[ch.toLowerCase()](ch);
};

var Board = function () {
  function Board() {
    var _this = this;

    _classCallCheck(this, Board);

    this.spaces = {};

    this.rows = ROW_LABELS.map(function (row, rowIndex) {
      return COL_LABELS.map(function (col, colIndex) {
        var space = new _space2.default(row, col);
        _this.spaces[space.label] = space;
        return space;
      });
    });
  }

  _createClass(Board, [{
    key: 'restoreState',
    value: function restoreState(fenString) {
      var _this2 = this;

      var nullArray = function nullArray(n) {
        var arr = [];
        for (var i = 0; i < n; i += 1) {
          arr.push(null);
        }
        return arr;
      };

      fenString.split('/').forEach(function (row, rowIndex) {
        row = row.split('').reduce(function (arr, col) {
          return arr.concat(col.match(/\d/) ? nullArray(col) : col);
        }, []);

        row.forEach(function (col, colIndex) {
          if (col) {
            _this2.rows[rowIndex][colIndex].setPiece(buildPiece(col));
          } else {
            _this2.rows[rowIndex][colIndex].clearPiece();
          }
        });
      });
    }
  }, {
    key: 'persistState',
    value: function persistState() {
      return this.rows.map(function (row) {
        return row.map(function (space) {
          return space.getPiece() ? space.getPiece().getLabel() : 1;
        }).reduce(function (arr, ch) {
          if (typeof ch === 'number' && typeof arr[arr.length - 1] === 'number') {
            arr[arr.length - 1] += ch;
          } else {
            arr.push(ch);
          }
          return arr;
        }, []).join('');
      }).join('/');
    }
  }, {
    key: 'getSpace',
    value: function getSpace() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length === 1) {
        // Space label (1a, 2b, etc)
        return this.spaces[args[0]];
      } else if (args.length === 2) {
        // x,y coord
        return this.rows[args[0]][args[1]];
      }

      throw new Error('getSpace expects 1 or 2 arguments');
    }
  }, {
    key: 'getSpaces',
    value: function getSpaces() {
      return this.rows;
    }
  }, {
    key: 'eachSpace',
    value: function eachSpace(callback) {
      var _this3 = this;

      Object.keys(this.spaces).forEach(function (label) {
        callback(_this3.spaces[label], label);
      });
    }
  }, {
    key: 'getRelativeSpace',
    value: function getRelativeSpace(space, piece, dx, dy) {
      var movable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var capture = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

      if (capture === null) {
        capture = movable;
      }

      if (piece.white()) {
        dy = -dy;
      }

      var x = space.x + dx;
      var y = space.y + dy;
      var dest = this.rows[y] && this.rows[y][x];

      if (dest) {
        if (movable) {
          if (dest.isEmpty() || capture && dest.piece.getColor() !== piece.getColor()) {
            return dest;
          }
        } else {
          return dest;
        }
      }

      return null;
    }
  }]);

  return Board;
}();

exports.default = Board;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

var _pawn = require('./pawn');

var _pawn2 = _interopRequireDefault(_pawn);

var _rook = require('./rook');

var _rook2 = _interopRequireDefault(_rook);

var _knight = require('./knight');

var _knight2 = _interopRequireDefault(_knight);

var _bishop = require('./bishop');

var _bishop2 = _interopRequireDefault(_bishop);

var _queen = require('./queen');

var _queen2 = _interopRequireDefault(_queen);

var _king = require('./king');

var _king2 = _interopRequireDefault(_king);

var _board = require('./board');

var _board2 = _interopRequireDefault(_board);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * TODO:
 *  - castling
 *  - full FEN state serialization
 *  - save and restore arbitrary states through UI
 *  - store state in URI?
 *  - store game states over time
 *  - undo, redo (forward and backward over state history)
 *  - check
 *  - check-mate, report victory
 *  - stale mate
 *  - pawn promotion
 *  - 50 move rule
 *  - en passant
 */

var ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
var COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var INITIAL_BOARD = 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1';

var Chess = function () {
  function Chess() {
    _classCallCheck(this, Chess);

    this.ROW_LABELS = ROW_LABELS;
    this.COL_LABELS = COL_LABELS;
  }

  _createClass(Chess, [{
    key: 'newGame',
    value: function newGame() {
      this.board = new _board2.default();
      this.restoreGame(INITIAL_BOARD);
      this.gameStates = [];
    }
  }, {
    key: 'restoreGame',
    value: function restoreGame(fenString) {
      var parts = fenString.split(' ');
      this.board.restoreState(parts[0]);
      this.currentTurn = parts[1] === 'w' ? 'white' : 'black';
      this.restoreCastling(parts[2]);
      this.restoreEnPassant(parts[3]);
      this.halfMoveCount = parseInt(parts[4], 10);
      this.moveCount = parseInt(parts[5], 10);
    }
  }, {
    key: 'persistGame',
    value: function persistGame() {
      var state = [this.board.persistState()];
      state.push(this.getCurrentTurn() === 'white' ? 'w' : 'b');
      state.push(this.persistCastling());
      state.push(this.persistEnPassant());
      state.push(this.halfMoveCount);
      state.push(this.moveCount);
      return state.join(' ');
    }
  }, {
    key: 'persistCastling',
    value: function persistCastling() {
      var _this = this;

      var castling = Object.keys(this.castling).filter(function (key) {
        return _this.castling[key];
      }).join('');
      return castling || '-';
    }
  }, {
    key: 'restoreCastling',
    value: function restoreCastling(str) {
      var _this2 = this;

      this.castling = {};
      ['K', 'Q', 'k', 'q'].forEach(function (flag) {
        _this2.castling[flag] = str.indexOf(flag) > -1;
      });
    }
  }, {
    key: 'persistEnPassant',
    value: function persistEnPassant() {
      return '-';
    }
  }, {
    key: 'restoreEnPassant',
    value: function restoreEnPassant(str) {
      // No-op
    }
  }, {
    key: 'move',
    value: function move(from, to) {
      var suspendRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var fromSpace = this.board.spaces[from];
      var toSpace = this.board.spaces[to];

      var piece = fromSpace.getPiece();
      if (suspendRules || piece.getMoves(fromSpace, this.getBoard()).indexOf(to) !== -1) {
        // Make sure we can legally move to the target space
        toSpace.setPiece(piece);
        fromSpace.clearPiece();
        this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
        return true;
      }
      return false;
    }

    // Return which color is in check, if any (null otherwise)

  }, {
    key: 'check',
    value: function check(gameState) {
      if (this.getBoard().isInCheck('white')) {
        return 'white';
      }

      if (this.getBoard().isInCheck('black')) {
        return 'black';
      }

      return null;
    }
  }, {
    key: 'getSpace',
    value: function getSpace(row, col) {
      return this.board.getSpace(row, col);
    }
  }, {
    key: 'getBoard',
    value: function getBoard() {
      return this.board;
    }
  }, {
    key: 'getCurrentTurn',
    value: function getCurrentTurn() {
      return this.currentTurn;
    }
  }]);

  return Chess;
}();

exports.default = Chess;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var King = function (_Piece) {
  _inherits(King, _Piece);

  function King() {
    _classCallCheck(this, King);

    return _possibleConstructorReturn(this, (King.__proto__ || Object.getPrototypeOf(King)).apply(this, arguments));
  }

  _createClass(King, [{
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      var _this2 = this;

      return Queen.deltas().map(function (delta) {
        return board.getRelativeSpace.apply(board, [space, _this2].concat(_toConsumableArray(delta), [true]));
      }).filter(function (n) {
        return n;
      });
    }
  }]);

  return King;
}(_piece2.default);

exports.default = King;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Knight = function (_Piece) {
  _inherits(Knight, _Piece);

  function Knight() {
    _classCallCheck(this, Knight);

    return _possibleConstructorReturn(this, (Knight.__proto__ || Object.getPrototypeOf(Knight)).apply(this, arguments));
  }

  _createClass(Knight, [{
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      var _this2 = this;

      var deltas = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
      return deltas.map(function (delta) {
        return board.getRelativeSpace.apply(board, [space, _this2].concat(_toConsumableArray(delta), [true]));
      }).filter(function (s) {
        return s;
      });
    }
  }]);

  return Knight;
}(_piece2.default);

exports.default = Knight;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pawn = function (_Piece) {
  _inherits(Pawn, _Piece);

  function Pawn() {
    _classCallCheck(this, Pawn);

    return _possibleConstructorReturn(this, (Pawn.__proto__ || Object.getPrototypeOf(Pawn)).apply(this, arguments));
  }

  _createClass(Pawn, [{
    key: 'isStartingRow',
    value: function isStartingRow(space) {
      return this.black() && space.row === '7' || this.white() && space.row === '2';
    }
  }, {
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      var _this2 = this;

      // by default we can move forward one space
      var moves = [board.getRelativeSpace(space, this, 0, 1, true, false)];

      if (this.isStartingRow(space)) {
        moves.push(board.getRelativeSpace(space, this, 0, 2, true, false));
      }
      // We can move forward two spaces if we're on the "starting line" for pawns
      // debugger;
      var captures = [board.getRelativeSpace(space, this, 1, 1), board.getRelativeSpace(space, this, -1, 1)];

      captures.forEach(function (c) {
        if (c && c.piece && c.piece.getColor() !== _this2.getColor()) {
          moves.push(c);
        }
      });

      // TODO : en passant
      return moves.filter(function (m) {
        return m;
      });
    }
  }]);

  return Pawn;
}(_piece2.default);

exports.default = Pawn;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Piece = function () {
  function Piece(ch) {
    _classCallCheck(this, Piece);

    this.ch = ch;
  }

  _createClass(Piece, [{
    key: 'getColor',
    value: function getColor() {
      return this.ch.toUpperCase() === this.ch ? 'white' : 'black';
    }
  }, {
    key: 'black',
    value: function black() {
      return this.getColor() === 'black';
    }
  }, {
    key: 'white',
    value: function white() {
      return this.getColor() === 'white';
    }
  }, {
    key: 'getLabel',
    value: function getLabel() {
      return this.ch;
    }
  }, {
    key: 'getMoves',
    value: function getMoves(space, board) {
      return this.getMovableSpaces(space, board).map(function (s) {
        return s.label;
      });
    }

    // Return a list of all valid moves for the given piece, from the given space, on the given board

  }, {
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      alert('Cannot call `getMovableSpaces` fo ');
    }
  }]);

  return Piece;
}();

exports.default = Piece;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Queen = function (_Piece) {
  _inherits(Queen, _Piece);

  function Queen() {
    _classCallCheck(this, Queen);

    return _possibleConstructorReturn(this, (Queen.__proto__ || Object.getPrototypeOf(Queen)).apply(this, arguments));
  }

  _createClass(Queen, [{
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      return Rook.prototype.getSlideMoves.call(this, space, board, Queen.deltas());
    }
  }], [{
    key: 'deltas',
    value: function deltas() {
      return Bishop.deltas().concat(Rook.deltas());
    }
  }]);

  return Queen;
}(_piece2.default);

exports.default = Queen;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _piece = require('./piece');

var _piece2 = _interopRequireDefault(_piece);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rook = function (_Piece) {
  _inherits(Rook, _Piece);

  function Rook() {
    _classCallCheck(this, Rook);

    return _possibleConstructorReturn(this, (Rook.__proto__ || Object.getPrototypeOf(Rook)).apply(this, arguments));
  }

  _createClass(Rook, [{
    key: 'getMovableSpaces',
    value: function getMovableSpaces(space, board) {
      console.log('get moves', space, board);
      return this.getSlideMoves(space, board, Rook.deltas());
    }
  }, {
    key: 'getSlideMoves',
    value: function getSlideMoves(space, board, deltas) {
      var _this2 = this;

      // slide along each delta until we hit a piece
      var moves = [];

      deltas.forEach(function (delta) {
        var newSpace = space;
        for (;;) {
          newSpace = board.getRelativeSpace.apply(board, [newSpace, _this2].concat(_toConsumableArray(delta), [true]));

          if (newSpace) {
            moves.push(newSpace);
          }

          // Stop when we hit the edge of the board or an occupied space
          if (!newSpace || newSpace.piece) {
            break;
          }
        }
      });

      return moves;
    }
  }], [{
    key: 'deltas',
    value: function deltas() {
      return [[0, 1], [0, -1], [1, 0], [-1, 0]];
    }
  }]);

  return Rook;
}(_piece2.default);

exports.default = Rook;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Space = function () {
  function Space(row, col) {
    _classCallCheck(this, Space);

    this.row = row;
    this.col = col;
    this.x = COL_LABELS.indexOf(col);
    this.y = ROW_LABELS.indexOf(row);

    this.label = '' + row + col;
    this.piece = null;

    this.color = (this.x + this.y % 2) % 2 ? 'black' : 'white';
  }

  _createClass(Space, [{
    key: 'isEmpty',
    value: function isEmpty() {
      return !this.piece;
    }
  }, {
    key: 'setPiece',
    value: function setPiece(piece) {
      this.piece = piece;
    }
  }, {
    key: 'clearPiece',
    value: function clearPiece() {
      this.piece = null;
    }
  }, {
    key: 'getPiece',
    value: function getPiece() {
      return this.piece;
    }
  }, {
    key: 'getColor',
    value: function getColor() {
      return this.color;
    }
  }, {
    key: 'getLabel',
    value: function getLabel() {
      return this.label;
    }
  }]);

  return Space;
}();

exports.default = Space;
