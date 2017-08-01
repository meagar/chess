import Piece from './piece'
import Pawn from './pawn'
import Rook from './rook'
import Knight from './knight'
import Bishop from './bishop'
import Queen from './queen'
import King from './king'

import Board from './board'

//const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
//const INITIAL_BOARD = 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1';
// A board where the king is in check
const INITIAL_BOARD = 'rnbq1bnr/p1pp1ppp/1pk5/4P3/2Q5/4P3/PPP2PPP/RNB1KBNR b KQkq - 0 1'

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
      const callback = (this.currentTurn === 'white' ? this.whiteFn : this.blackFn);

      callback(this).then((move) => {

      });
    }
  }

  newGame() {
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

    if (suspendRules || this.canMove(fromSpace, toSpace, piece)) {
      // Make sure we can legally move to the target space
      const capture = toSpace.getPiece();
      toSpace.setPiece(piece);
      fromSpace.clearPiece();

      if (this.getPlayerInCheck() === piece.getColor()) {
        // This move would expose the player's own king to check
        fromSpace.setPiece(toSpace.getPiece());
        toSpace.setPiece(capture);
        return false;
      }

      this.currentTurn = this.currentTurn === 'black' ? 'white' : 'black';
      return true;
    }
    return false;
  }

  canMove(fromSpace, toSpace, piece) {
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

  // Return which color is in check, if any (null otherwise)
  getPlayerInCheck() {
    return ['white', 'black'].find((color) => {
      let kingSpace = this.getBoard().findKing(color)
      return kingSpace.isUnderThreat(this.getBoard());
    });
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
    return this.currentTurn;
  }
}

Chess.ROW_LABELS = Board.ROW_LABELS;
Chess.COL_LABELS = Board.COL_LABELS;

if (typeof window !== 'undefined') {
  window.Chess = Chess;
} else if (typeof exports !== 'undefined') {
  exports.Chess = Chess;
}
