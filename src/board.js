import Move from './move';

import Piece from './piece';
import Pawn from './pawn';
import Rook from './rook';
import Knight from './knight';
import Bishop from './bishop';
import Queen from './queen';
import King from './king';

import Space from './space';

const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function buildPiece(ch) {
  const classMap = {
    p: Pawn, r: Rook, n: Knight, b: Bishop, q: Queen, k: King,
  };

  return new classMap[ch.toLowerCase()](ch);
}

const BLANK_BOARD = new Array(64);

export default class Board {
  constructor(spaces = BLANK_BOARD) {
    this._spaces = spaces;
    this._moves = {};

    // Pregenerate moves for each piece at each space
    for (let x = 0; x < 8; x += 1) {
      this._moves[x] = {};

      for (let y = 0; y < 8; y += 1) {
        this._moves[x][y] = {
          null: [],
          r: this.generateRookMoves(x, y),
          n: this.generateKnightMoves(x, y),
        };

        this._moves[x][y].N = this._moves[x][y].n;
        this._moves[x][y].R = this._moves[x][y].r;
      }
    }
  }

  static labelToCoords(label) {
    return [COL_LABELS.indexOf(label[0]), ROW_LABELS.indexOf(label[1])];
  }

  static coordsToLabel(x, y) {
    return COL_LABELS[x] + ROW_LABELS[y];
  }

  getMovesByLabel(label) {
    return this.getMovesByCoords(...Board.labelToCoords(label));
  }

  getMovesByCoords(x, y) {
    return this._moves[x][y][this.getSpace(x, y) || null];
  }

  move(xSrc, ySrc, xDest, yDest) {
    if (arguments.length === 2) {
      [xSrc, ySrc] = Board.labelToCoords(arguments[0]);
      [xDest, yDest] = Board.labelToCoords(arguments[1]);
    }
  }

  getSpace(x, y) {
    return this._spaces[x + (y * 8)];
  }

  setSpace(x, y, ch) {
    this._spaces[x + (y * 8)] = ch;
  }

  restoreState(fenString) {
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
          this.setSpace(rowIndex, colIndex, col);
        }
      });
    });
  }

  persistState() {
    const fen = [];
    for (let x = 0; x < 8; x += 1) {
      const row = [];
      for (let y = 0; y < 8; y += 1) {
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

  generateKnightMoves(x, y) {
    const deltas = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
    return deltas.map(delta => this.buildMove(x + delta[0], y + delta[1])).filter(s => s);
  }

  generateRookMoves(x, y) {
    const deltas = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    return deltas.map(delta => this.buildMoveList(x, y, ...delta)).filter(s => s);
  }

  buildMoveList(x1, y1, dx, dy) {
    let root = null;
    let prev = null;

    for (let x = x1 + dx, y = y1 + dy; x >= 0 && x < 8 && y >= 0 && y <= 7; x += dx, y += dy) {
      const move = new Move(x, y, prev);
      if (!root) { root = move; }
      prev = move;
    }

    return root;
  }

  buildMove(x, y) {
    if (x >= 0 && x < 7 && y > 0 && y < 8) {
      return new Move(x, y);
    }
    return false;
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
        callback(this.getSpace(x, y), x, y);
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
