import Piece from './piece'
import Pawn from './pawn'
import Rook from './rook'
import Knight from './knight'
import Bishop from './bishop'
import Queen from './queen'
import King from './king'

import Board from './board'

const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
//const INITIAL_BOARD = 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1';
// A board where the king is in check
//const INITIAL_BOARD = 'rnbq1bnr/p1pp1ppp/1pk2P1/4P3/215/4P3/PPP2PPP/RNB1KBNR b KQkq - 0 1'
//const INITIAL_BOARD = 'rnbqkbnr/2ppppp1/pp5p/8/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1';

export default class Chess {
  constructor(whiteFn, blackFn, state) {
    this.ROW_LABELS = Board.ROW_LABELS;
    this.COL_LABELS = Board.COL_LABELS;
    this.INITIAL_BOARD = INITIAL_BOARD;

    this.board = new Board();

    this.whiteFn = whiteFn;
    this.blackFn = blackFn;

    if (state) {
      this.restoreGame(state);
    }
  }

  run() {
    for (;;) {
      const callback = (this._currentTurn === 'white' ? this.whiteFn : this.blackFn);

      callback(this).then((move) => {

      });
    }
  }

  newGame() {
    this.restoreGame(INITIAL_BOARD);
    this.gameStates = [];
  }

  // Restore the game state from a FEN string
  restoreGame(fenString) {
    const parts = fenString.split(' ');
    this.board.restoreState(parts[0]);
    this._currentTurn = parts[1] === 'w' ? 'white' : 'black';

    this._restoreCastling(parts[2]);
    this._restoreEnPassant(parts[3]);
    this.halfMoveCount = parseInt(parts[4], 10);
    this.moveCount = parseInt(parts[5], 10);
  }

  // Produce a FEN string for the current game state
  persistGame() {
    const state = [this.board.persistState()];
    state.push(this.getCurrentTurn() === 'white' ? 'w' : 'b');
    state.push(this._persistCastling());
    state.push(this._persistEnPassant());
    state.push(this.halfMoveCount);
    state.push(this.moveCount);
    return state.join(' ');
  }

  // space - A Space object or coords in the form 'c1'
  // piece - The piece to get moves for; null to use piece occupying space
  getMoves(space, piece) {
    if (arguments.length == 1) {
      if (typeof space == 'string') {
        space = this.getSpace(space);
      }
      if (!piece && arguments.length === 1) {
        piece = space.getPiece();
      }
    }

    return piece.getMoves(space, this.getBoard());
  }

  move(from, to, suspendRules = false) {
    const fromSpace = this.board.getSpace(from);
    const toSpace = this.board.getSpace(to);
    const piece = fromSpace.getPiece();


    if (piece.getColor() !== this.getCurrentTurn()) {
      alert(`Player ${piece.getColor()} tried to move on ${this.getCurrentTurn()}'s turn`);
      return false;
    }

    if (suspendRules || this._canMove(fromSpace, toSpace, piece)) {
      // Make sure we can legally move to the target space
      const capture = toSpace.getPiece();
      toSpace.setPiece(piece);
      fromSpace.clearPiece();
      this._currentTurn = this._currentTurn === 'black' ? 'white' : 'black';
      return true;
    }
    return false;
  }

  _canMove(fromSpace, toSpace, piece) {
    if (this._validateMove(fromSpace, toSpace, piece)) {
      // Make sure we can legally move to the target space
      const capture = toSpace.getPiece();
      toSpace.setPiece(piece);
      fromSpace.clearPiece();

      const canMove = !this.playerIsInCheck(piece.getColor());

      // This move would expose the player's own king to check
      fromSpace.setPiece(toSpace.getPiece());
      toSpace.setPiece(capture);

      return canMove;
    }
    return false;
  }

  getWinner() {
    const color = this.getPlayerInCheck()

    console.log(color, "is in check, checking for vicotry")
    // Figure out if either player is in check, and if that player can escape it
    this.board.eachPiece(color, (piece, space) => {
      this.getMoves(space, piece)
      console.log(piece, space)
    })
  }

  // Return which color is in check, if any (null otherwise)
  getPlayerInCheck() {
    return ['white', 'black'].find((color) => {
      let kingSpace = this.getBoard().findKing(color)
      return kingSpace.isUnderThreat(this.getBoard());
    });
  }

  playerIsInCheck(color) {
    // TODO optimize
    return this.getPlayerInCheck() === color;
  }

  getSpace(rank, file) {
    if (arguments.length == 2) {
      return this.getBoard().getSpace(rank, file);
    } else {
      return this.getBoard().getSpace(rank);
    }
  }

  getBoard() {
    return this.board;
  }

  getCurrentTurn() {
    return this._currentTurn;
  }

  //
  // Private
  //

  _persistCastling() {
    const castling = Object.keys(this.castling).filter(key => this.castling[key]).join('');
    return castling || '-';
  }

  _restoreCastling(str) {
    this.castling = {};
    ['K', 'Q', 'k', 'q'].forEach((flag) => {
      this.castling[flag] = (str.indexOf(flag) > -1);
    });
  }

  _persistEnPassant() {
    return '-';
  }

  _restoreEnPassant(str) {
    // No-op
  }

  // Return true if the give piece can move to the given space (no checking of check/checkmate)
  _validateMove(fromSpace, toSpace, piece) {
    // First verify that the given space is reachable by this piece
    if (piece.getMoves(fromSpace, this.getBoard()).indexOf(toSpace.getLabel()) === -1) {
      return false;
    }

    // We can't capture kings
    if (toSpace.getPiece() && toSpace.getPiece().ch.toLowerCase() == 'k') {
      return false;
    }

    return true;
  }
}

Chess.ROW_LABELS = Board.ROW_LABELS;
Chess.COL_LABELS = Board.COL_LABELS;

if (typeof window !== 'undefined') {
  window.Chess = Chess;
} else if (typeof exports !== 'undefined') {
  exports.Chess = Chess;
}

Chess.buildPiece = function (ch) {
  const klass = {
    p: Pawn,
    n: Knight,
    b: Bishop,
    r: Rook,
    q: Queen,
    k: King
  }[ch.toLowerCase()];

  return new klass(ch);
}
