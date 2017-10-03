import Board from './board';

const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Pawn capture test
// const INITIAL_BOARD = 'rnbqkbnr/pppppppp/8/2pp7/3P7/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// A board where the black king can move into check
// const INITIAL_BOARD = 'rnbq1bnr/p1pp1ppp/1pk2P1/4P3/215/4P3/PPP2PPP/RNB1KBNR b KQkq - 0 1';

// A board where white can promote
// const INITIAL_BOARD = '8/1P6/8/8/k/8/K4p/8 w KQkq - 0 1';

export default class Chess {
  constructor(whiteFn, blackFn) {
    this.ROW_LABELS = Board.ROW_LABELS;
    this.COL_LABELS = Board.COL_LABELS;

    this._boardStates = [];
    this._board = new Board();

    this.whiteFn = whiteFn;
    this.blackFn = blackFn;

    this._currentTurnWhite = true; // white
  }

  // run() {
  //   for (;;) {
  //     const callback = (this._currentTurnWhite ? this.whiteFn : this.blackFn);
  //
  //     callback(this).then((move) => {
  //
  //     });
  //   }
  // }

  newGame() {
    this.restoreGame(INITIAL_BOARD);
    this.gameStates = [];
  }

  // Restore the game state from a FEN string
  restoreGame(fenString) {
    const parts = fenString.split(' ');
    this._board = Board.restoreState(parts[0]);
    this._currentTurnWhite = parts[1] === 'w';

    this._restoreCastling(parts[2]);
    this._restoreEnPassant(parts[3]);
    this.halfMoveCount = parseInt(parts[4], 10);
    this.moveCount = parseInt(parts[5], 10);
  }

  // Produce a FEN string for the current game state
  persistGame() {
    const state = [this.getBoard().persistState()];
    state.push(this.getCurrentTurn() === 'white' ? 'w' : 'b');
    state.push(this._persistCastling());
    state.push(this._persistEnPassant());
    state.push(this.halfMoveCount);
    state.push(this.moveCount);
    return state.join(' ');
  }

  getPiece(label) {
    return this.getBoard().getSpace(...Board.labelToCoords(label));
  }

  setPiece(label, ch) {
    this._board = this.getBoard().setSpace(...Board.labelToCoords(label), ch);
  }

  getMoves(label) {
    const moves = this.getBoard().getMoves(...Board.labelToCoords(label));

    return moves.map((m) => {
      return {
        from: label,
        to: Board.coordsToLabel(m.x, m.y),
        capture: m.capture === true,
        promotion: m.promotion === true,
      };
    });
  }

  // Returns a promise
  move(from, to, options = {}) {
    const [fromX, fromY] = Board.labelToCoords(from);
    const [toX, toY] = Board.labelToCoords(to);

    // Sanity check and error-raising
    const piece = this.getBoard().getSpace(fromX, fromY);

    if (Board.isWhite(piece) !== this._currentTurnWhite) {
      throw new Error('Invalid move: Wrong piece color');
    }

    const move = this.getMoves(from).find(m => m.to === to);

    if (!move) {
      throw new Error(`Invalid move: Can't move from ${from} to ${to}`);
    }

    return new Promise((resolve, reject) => {
      let movePromise = Promise.resolve();

      if (move.promotion) {
        if (!options.promotion) {
          throw new Error('This move requires a promotion but options.promotion was null');
        }
        movePromise = options.promotion(this, to, piece);
      }

      movePromise.then((promotion) => {
        const newBoard = this._board.move(fromX, fromY, toX, toY, promotion);
        this._boardStates.push(this._board);
        this._board = newBoard;
        this._currentTurnWhite = !this._currentTurnWhite;
        resolve();
      });
    });
  }

  _canMove(fromSpace, toSpace, piece, options) {
    if (options.suspendRules) { return true; }

    if (this._validateMove(fromSpace, toSpace, piece)) {
      // Make sure we can legally move to the target space
      const capture = toSpace.getPiece();
      toSpace.setPiece(piece);
      fromSpace.clearPiece();

      // See if this move would expose the player's own king to check
      const canMove = !this.playerIsInCheck(piece.getColor());

      // Restore the old state of the board
      fromSpace.setPiece(piece);
      toSpace.setPiece(capture);

      return canMove;
    }
    return false;
  }

  getWinner() {
    // if it's white's turn, black just moved and white may be in mate
    if (this._currentTurnWhite === true && this._board.playerIsInCheckMate(true)) {
      return 'black';
    }

    // It's black's turn, white just moved and black may be in mate
    if (this._currentTurnWhite === false && this._board.playerIsInCheckMate(false)) {
      return 'white';
    }

    return undefined;
  }

  getPlayerInCheck() {
    return ['white', 'black'].find(color => this.playerIsInCheck(color));
  }

  playerIsInCheck(color) {
    if (color !== 'white' && color !== 'black') {
      throw new Error(`Invalid color given to #playerIsInCheck: ${color}`);
    }

    return this._board.playerIsInCheck(color === 'white');
  }

  getSpace(rank, file) {
    if (arguments.length === 2) {
      return this.getBoard().getSpace(rank, file);
    }
    return this.getBoard().getSpace(rank);
  }

  getBoard() {
    return this._board;
  }

  getCurrentTurn() {
    return this._currentTurnWhite ? 'white' : 'black';
  }

  eachSpace(callback) {
    this.getBoard().eachSpace((x, y, ch) => {
      callback(Board.coordsToLabel(x, y), ch);
    });
  }

  static getPieceColor(ch) {
    return Board.isWhite(ch) ? 'white' : 'black';
  }

  static getSpaceColor(ch) {
    const [x, y] = Board.labelToCoords(ch);
    return Board.getSpaceColor(x, y);
  }

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
  _validateMove(fromSpace, toSpace, piece, options) {
    // First verify that the given space is reachable by this piece
    if (piece.getMoves(fromSpace, this.getBoard()).indexOf(toSpace.getLabel()) === -1) {
      return false;
    }

    // We can't capture kings
    if (toSpace.getPiece() && toSpace.getPiece().ch.toLowerCase() === 'k') {
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
