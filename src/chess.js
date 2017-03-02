import Board from './board'

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

const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const INITIAL_BOARD = 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1';

class Piece {
  constructor(ch) {
    this.ch = ch;
  }

  getColor() {
    return (this.ch.toUpperCase() === this.ch) ? 'white' : 'black';
  }

  black() { return this.getColor() === 'black'; }
  white() { return this.getColor() === 'white'; }

  getLabel() { return this.ch; }

  getMoves(space, board) {
    return this.getMovableSpaces(space, board).map(s => s.label);
  }

  // Return a list of all valid moves for the given piece, from the given space, on the given board
  getMovableSpaces(space, board) {
    alert('Cannot call `getMovableSpaces` fo ');
  }
}

class Pawn extends Piece {
  isStartingRow(space) {
    return (this.black() && space.row === '7') || (this.white() && space.row === '2');
  }

  getMovableSpaces(space, board) {
    // by default we can move forward one space
    const moves = [board.getRelativeSpace(space, this, 0, 1, true, false)];

    if (this.isStartingRow(space)) {
      moves.push(board.getRelativeSpace(space, this, 0, 2, true, false));
    }
    // We can move forward two spaces if we're on the "starting line" for pawns
    // debugger;
    const captures = [
      board.getRelativeSpace(space, this, 1, 1),
      board.getRelativeSpace(space, this, -1, 1),
    ];

    captures.forEach((c) => {
      if (c && c.piece && c.piece.getColor() !== this.getColor()) {
        moves.push(c);
      }
    });

    // TODO : en passant
    return moves.filter(m => m);
  }
}

class Knight extends Piece {
  getMovableSpaces(space, board) {
    const deltas = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
    return deltas.map(delta => board.getRelativeSpace(space, this, ...delta, true)).filter(s => s);
  }
}

class Rook extends Piece {
  static deltas() { return [[0, 1], [0, -1], [1, 0], [-1, 0]]; }

  getMovableSpaces(space, board) {
    console.log('get moves', space, board);
    return this.getSlideMoves(space, board, Rook.deltas());
  }

  getSlideMoves(space, board, deltas) {
    // slide along each delta until we hit a piece
    const moves = [];

    deltas.forEach((delta) => {
      let newSpace = space;
      for (;;) {
        newSpace = board.getRelativeSpace(newSpace, this, ...delta, true);

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
}

class Bishop extends Rook {
  static deltas() { return [[1, 1], [1, -1], [-1, 1], [-1, -1]]; }

  getMovableSpaces(space, board) {
    return Rook.prototype.getSlideMoves.call(this, space, board, Bishop.deltas());
  }
}

class Queen extends Piece {
  static deltas() {
    return Bishop.deltas().concat(Rook.deltas());
  }
  getMovableSpaces(space, board) {
    return Rook.prototype.getSlideMoves.call(this, space, board, Queen.deltas());
  }
}

class King extends Piece {
  getMovableSpaces(space, board) {
    return Queen.deltas().map((delta) => {
      return board.getRelativeSpace(space, this, ...delta, true);
    }).filter(n => n);
  }
}

Piece.build = function build(ch) {
  const classMap = {
    p: Pawn, r: Rook, n: Knight, b: Bishop, q: Queen, k: King,
  };

  return new classMap[ch.toLowerCase()](ch);
};

class Space {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.x = COL_LABELS.indexOf(col);
    this.y = ROW_LABELS.indexOf(row);

    this.label = `${row}${col}`;
    this.piece = null;

    this.color = ((this.x + (this.y % 2)) % 2) ? 'black' : 'white';
  }

  isEmpty() {
    return !this.piece;
  }

  setPiece(piece) {
    this.piece = piece;
  }

  clearPiece() {
    this.piece = null;
  }

  getPiece() { return this.piece; }
  getColor() { return this.color; }
  getLabel() { return this.label; }
}

class Chess {
  constructor() {
    this.ROW_LABELS = ROW_LABELS;
    this.COL_LABELS = COL_LABELS;
  }

  newGame() {
    this.board = new Board();
    this.restoreGame(INITIAL_BOARD);
    this.gameStates = [];
  }

  restoreGame(fenString) {
    const parts = fenString.split(' ');
    this.board.restoreState(parts[0]);
    this.currentTurn = parts[1] === 'w' ? 'white' : 'black';
    this.restoreCastling(parts[2]);
    this.restoreEnPassant(parts[3]);
    this.halfMoveCount = parseInt(parts[4], 10);
    this.moveCount = parseInt(parts[5], 10);
  }

  persistGame() {
    const state = [this.board.persistState()];
    state.push(this.getCurrentTurn() === 'white' ? 'w' : 'b');
    state.push(this.persistCastling());
    state.push(this.persistEnPassant());
    state.push(this.halfMoveCount);
    state.push(this.moveCount);
    return state.join(' ');
  }

  persistCastling() {
    const castling = Object.keys(this.castling).filter(key => this.castling[key]).join('');
    return castling || '-';
  }

  restoreCastling(str) {
    this.castling = {};
    ['K', 'Q', 'k', 'q'].forEach((flag) => {
      this.castling[flag] = (str.indexOf(flag) > -1);
    });
  }

  persistEnPassant() {
    return '-';
  }

  restoreEnPassant(str) {
    // No-op
  }

  move(from, to, suspendRules = false) {
    const fromSpace = this.board.spaces[from];
    const toSpace = this.board.spaces[to];

    const piece = fromSpace.getPiece();
    if (suspendRules || (piece.getMoves(fromSpace, this.getBoard()).indexOf(to) !== -1)) {
      // Make sure we can legally move to the target space
      toSpace.setPiece(piece);
      fromSpace.clearPiece();
      this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
      return true;
    }
    return false;
  }

  // Return which color is in check, if any (null otherwise)
  check(gameState) {
    if (this.getBoard().isInCheck('white')) {
      return 'white';
    }

    if (this.getBoard().isInCheck('black')) {
      return 'black';
    }

    return null;
  }

  getSpace(row, col) {
    return this.board.getSpace(row, col);
  }

  getBoard() {
    return this.board;
  }

  getCurrentTurn() {
    return this.currentTurn;
  }
}

export default Chess;
