import Move from './move';
import PawnMove from './pawn_move';

const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const BLANK_BOARD = new Array(64);

let moveCache;

export default class Board {
  constructor(spaces = BLANK_BOARD) {
    this._spaces = spaces.slice(0);

    Board.buildMoveCache();
  }

  static buildMoveCache() {
    if (moveCache) { return; }

    moveCache = {};

    // Pregenerate moves for each piece at each space
    for (let x = 0; x < 8; x += 1) {
      moveCache[x] = {};

      for (let y = 0; y < 8; y += 1) {
        const moves = {
          null: [],
          p: Board.generatePawnMoves(x, y, false),
          P: Board.generatePawnMoves(x, y, true),
          r: Board.generateRookMoves(x, y),
          n: Board.generateKnightMoves(x, y),
          b: Board.generateBishopMoves(x, y),
          q: Board.generateQueenMoves(x, y),
          k: Board.generateKingMoves(x, y),
        };

        moves.R = moves.r;
        moves.N = moves.n;
        moves.B = moves.b;
        moves.Q = moves.q;
        moves.K = moves.k;

        moveCache[x][y] = moves;
      }
    }
  }

  static labelToCoords(label) {
    return [COL_LABELS.indexOf(label[0]), ROW_LABELS.indexOf(label[1])];
  }

  static coordsToLabel(x, y) {
    return COL_LABELS[x] + ROW_LABELS[y];
  }

  static getSpaceColor(x, y) {
    return ((x + y) % 2) === 0 ? 'white' : 'black';
  }

  // Returns true if white, false if black
  static isWhite(ch) {
    if (ch === 'P' || ch === 'R' || ch === 'N' || ch === 'B' || ch === 'Q' || ch === 'K') {
      return true;
    }

    if (ch === 'p' || ch === 'r' || ch === 'n' || ch === 'b' || ch === 'q' || ch === 'k') {
      return false;
    }

    throw new Error(`Invalid piece in isWhite: ${ch}`);
  }

  static getCachedMoves(x, y, piece) {
    return moveCache[x][y][piece];
  }

  // Return a list of moves for the piece at (x, y)
  getMoves(x, y) {
    const piece = this.getSpace(x, y);
    const white = Board.isWhite(piece);

    // Potential moves are the cached list of possible moves for the given piece at the given location
    const potentialMoves = Board.getCachedMoves(x, y, piece);

    if (piece === 'p' || piece === 'P') {
      return this._getPawnMoves(x, y, potentialMoves, piece, white);
    }
    return this._getNonPawnMoves(x, y, potentialMoves, piece, white);
  }

  _getPawnMoves(x, y, potentialMoves, piece, white) {
    const moves = [];

    // We need to filter them down to the moves that are valid in the given board state
    potentialMoves.forEach((move) => {
      if (move.capture === true) {
        // Pawn capture
        const dest = this.getSpace(move.x, move.y);
        if (dest) {
          if (Board.isWhite(dest) !== white) {
            // Destination is occupied by opposite color
            moves.push({ x: move.x, y: move.y, capture: true, promotion: move.promotion });
          }
        }
      } else {
        // Pawn move that cannot capture
        do {
          const dest = this.getSpace(move.x, move.y);
          if (!dest) {
            // The space is clear, we can advance here
            moves.push({ x: move.x, y: move.y, capture: false, promotion: move.promotion });
          } else {
            // The space was blocked, we can't advance, and we should stop checking
            break;
          }
          move = move.next;
        } while (move);
      }
    });

    return moves;
  }

  _getNonPawnMoves(x, y, potentialMoves, piece, white) {
    const moves = [];

    // We need to filter them down to the moves that are valid in the given board state
    potentialMoves.forEach((move) => {
      // Regular move (possibly a slide move)
      // Return moves until no more moves in this direction, *or* we encounter a blocked space
      do {
        const dest = this.getSpace(move.x, move.y);

        if (dest) {
          // Space is occupied...
          if (Board.isWhite(dest) !== white) {
            // by an enemy piece
            moves.push({ x: move.x, y: move.y, capture: true });
          }
          // Stop sliding
          move = null;
        } else {
          // Space is empty, we can freely move here...
          moves.push({ x: move.x, y: move.y, capture: false });
          // ... and continue sliding
          move = move.next;
        }
      } while (move);
    });

    return moves;
  }

  // Return a new board with the given move applied
  move(x1, y1, x2, y2) {
    const newBoard = new Board(this._spaces);
    const piece = newBoard.getSpace(x1, y1);
    /* eslint-disable no-underscore-dangle */
    newBoard._setSpace(x2, y2, piece);
    newBoard._clearSpace(x1, y1);

    return newBoard;
  }

  getSpace(x, y) {
    return this._spaces[x + (y * 8)];
  }

  setSpace(x, y, ch) {
    const newBoard = new Board(this._spaces);
    newBoard._setSpace(x, y, ch);
    return newBoard;
  }

  _setSpace(x, y, ch) {
    this._spaces[x + (y * 8)] = ch;
  }

  _clearSpace(x, y) {
    this._spaces[x + (y * 8)] = null;
  }

  static restoreState(fenString) {
    const board = new Board();

    const nullArray = function (n) {
      const arr = [];
      for (let i = 0; i < n; i += 1) {
        arr.push(null);
      }
      return arr;
    };

    fenString.split('/').forEach((row, rowIndex) => {
      row = row.split('').reduce((arr, col) => {
        return arr.concat(col.match(/\d/) ? nullArray(col) : col);
      }, []);

      row.forEach((col, colIndex) => {
        if (col) {
          board._setSpace(colIndex, rowIndex, col);
        }
      });
    });

    return board;
  }

  persistState() {
    const fen = [];
    for (let y = 0; y < 8; y += 1) {
      const row = [];
      for (let x = 0; x < 8; x += 1) {
        const ch = this.getSpace(x, y);
        if (!ch) {
          if (typeof row[row.length - 1] === 'number') {
            row[row.length - 1] += 1;
          } else {
            row.push(1);
          }
        } else {
          row.push(ch);
        }
      }
      fen.push(row.join(''));
    }

    return fen.join('/');
  }

  static generatePawnMoves(x, y, white = true) {
    const black = !white;
    const moves = [];

    const dy = (white ? -1 : 1);

    if (y + dy >= 0 && y + dy <= 7) {
      moves.push(new PawnMove(x, y + dy, null, false));
    }

    if ((white && y === 6) || (black && y === 1)) {
      // We're on the home row, we can advance two spaces
      /* eslint-disable no-new */
      new PawnMove(x, y + (2 * dy), moves[moves.length - 1], false);
    }

    // Captures (side-to-side moves)
    if (x > 1) {
      moves.push(new PawnMove(x - 1, y + dy, null, true));
    }

    if (x < 7) {
      moves.push(new PawnMove(x + 1, y + dy, null, true));
    }

    return moves;
  }

  static generateKnightMoves(x, y) {
    const deltas = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
    return this.deltasToMoves(x, y, deltas, { slide: false });
  }

  static generateRookMoves(x, y) {
    const deltas = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    return this.deltasToMoves(x, y, deltas, { slide: true });
  }

  static generateBishopMoves(x, y) {
    const deltas = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    return this.deltasToMoves(x, y, deltas, { slide: true });
  }

  static generateQueenMoves(x, y) {
    const deltas = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]];
    return this.deltasToMoves(x, y, deltas, { slide: true });
  }

  static generateKingMoves(x, y) {
    const deltas = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]];
    return this.deltasToMoves(x, y, deltas, { slide: false });
  }

  // Turn a list of deltas into valid moves
  // options:
  //   class: The move class (Move or PawnMove)
  //   slide: Whether to return a list of moves for each delta, sliding in the given direction
  static deltasToMoves(x, y, deltas, options = {}) {
    let moves = null;

    if (options.slide) {
      moves = deltas.map(d => this.buildSlideMove(x, y, ...d));
    } else {
      moves = deltas.map(d => this.buildMove(x + d[0], y + d[1], options.class));
    }

    // Either method may return `null` for moves that leave the board, filter them out
    return moves.filter(m => m);
  }

  // Advance in the given direction until we run off the board
  // Used for queens, rooks, bishops
  static buildSlideMove(x1, y1, dx, dy) {
    let root = null;
    let prev = null;

    for (let x = x1 + dx, y = y1 + dy; x >= 0 && x < 8 && y >= 0 && y <= 7; x += dx, y += dy) {
      const move = new Move(x, y, prev);
      if (!root) { root = move; }
      prev = move;
    }

    return root;
  }

  // Generate a single move to the given x,y coords
  // Used for Kings, Knights, Pawns
  static buildMove(x, y, MoveClass = Move) {
    return (x >= 0 && x < 8 && y > 0 && y < 8) && new MoveClass(x, y);
  }

  // getSpace(...args) {
  //   if (args.length === 1) {
  //     // Space label (1a, 2b, etc)
  //     return this.spaces[args[0]];
  //   } else if (args.length === 2) {
  //     // x,y coord
  //     return this.rows[args[0]][args[1]];
  //   }
  //
  //   throw new Error('getSpace expects 1 or 2 arguments');
  // }

  getSpaces() {
    return this._spaces;
  }

  findKing(color) {
    const search = (color === 'white' ? 'K' : 'k');
  }

  eachSpace(callback) {
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        callback(x, y, this.getSpace(x, y));
      }
    }
  }

  // eachPiece(color, callback) {
  //   if (arguments.length === 1) {
  //     callback = color;
  //     color = false;
  //   }
  //
  //   this.eachSpace((space) => {
  //     const piece = space.getPiece();
  //     if (piece) {
  //       if (!color || piece.getColor() === color) {
  //         callback(piece, space);
  //       }
  //     }
  //   });
  // }
  //
  // // movable - If true, only return the space if it's empty
  // // capture - If true, only return the space if it contains a piece of the opposite color
  // getRelativeSpace(space, piece, dx, dy, movable = false, capture = null) {
  //   if (capture === null) {
  //     capture = movable;
  //   }
  //
  //   if (piece.white()) {
  //     dy = -dy;
  //   }
  //
  //   const x = space.x + dx;
  //   const y = space.y + dy;
  //   const dest = (this.rows[y] && this.rows[y][x]);
  //
  //   if (dest) {
  //     if (movable) {
  //       if (dest.isEmpty() || (capture && (dest.piece.getColor() !== piece.getColor()))) {
  //         return dest;
  //       }
  //     } else {
  //       return dest;
  //     }
  //   }
  //
  //   return null;
  // }
}

Board.ROW_LABELS = ROW_LABELS;
Board.COL_LABELS = COL_LABELS;
