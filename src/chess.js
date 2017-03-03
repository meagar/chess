import Piece from './piece'
import Pawn from './pawn'
import Rook from './rook'
import Knight from './knight'
import Bishop from './bishop'
import Queen from './queen'
import King from './king'

import Board from './board'

// const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const INITIAL_BOARD = 'rnbqkbnr/pppp1ppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1';

export default class Chess {
  constructor() {
    this.ROW_LABELS = Board.ROW_LABELS;
    this.COL_LABELS = Board.COL_LABELS;
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

Chess.ROW_LABELS = Board.ROW_LABELS;
Chess.COL_LABELS = Board.COL_LABELS;

window.Chess = Chess;
