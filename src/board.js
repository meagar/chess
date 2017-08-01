import Piece from './piece'
import Pawn from './pawn'
import Rook from './rook'
import Knight from './knight'
import Bishop from './bishop'
import Queen from './queen'
import King from './king'

import Space from './space';

function buildPiece(ch) {
  const classMap = {
    p: Pawn, r: Rook, n: Knight, b: Bishop, q: Queen, k: King,
  };

  return new classMap[ch.toLowerCase()](ch);
};

const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default class Board {
  constructor() {
    this.spaces = {};

    this.rows = ROW_LABELS.map((row, rowIndex) => {
      return COL_LABELS.map((col, colIndex) => {
        const space = new Space(row, col);
        this.spaces[space.label] = space;
        return space;
      });
    });
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
          this.rows[rowIndex][colIndex].setPiece(buildPiece(col));
        } else {
          this.rows[rowIndex][colIndex].clearPiece();
        }
      });
    });
  }

  persistState() {
    return this.rows.map((row) => {
      return row.map((space) => {
        return space.getPiece() ? space.getPiece().getLabel() : 1;
      }).reduce((arr, ch) => {
        if (typeof ch === 'number' && typeof arr[arr.length - 1] === 'number') {
          arr[arr.length - 1] += ch;
        } else {
          arr.push(ch);
        }
        return arr;
      }, []).join('');
    }).join('/');
  }

  getSpace(...args) {
    if (args.length === 1) {
      // Space label (1a, 2b, etc)
      return this.spaces[args[0]];
    } else if (args.length === 2) {
      // x,y coord
      return this.rows[args[0]][args[1]];
    }

    throw new Error('getSpace expects 1 or 2 arguments');
  }

  getSpaces() {
    return Object.values(this.spaces);
  }

  findKing(color) {
    const search = (color == 'white' ? 'K' : 'k');

    return this.getSpaces().find((space) => {
      return space.getPiece() && space.getPiece().ch == search;
    })
  }

  eachSpace(callback) {
    Object.keys(this.spaces).forEach((label) => {
      callback(this.spaces[label], label);
    });
  }

  eachPiece(color, callback) {
    if (arguments.length == 1) {
      callback = color;
      color = false;
    }

    this.eachSpace((space) => {
      let piece = space.getPiece();
      if (piece) {
        if (!color || piece.getColor() == color) {
          callback(piece, space);
        }
      }
    })
  }

  // movable - If true, only return the space if it's empty
  // capture - If true, only return the space if it contains a piece of the opposite color
  getRelativeSpace(space, piece, dx, dy, movable = false, capture = null) {
    if (capture === null) {
      capture = movable;
    }

    if (piece.white()) {
      dy = -dy;
    }

    const x = space.x + dx;
    const y = space.y + dy;
    const dest = (this.rows[y] && this.rows[y][x]);

    if (dest) {
      if (movable) {
        if (dest.isEmpty() || (capture && (dest.piece.getColor() !== piece.getColor()))) {
          return dest;
        }
      } else {
        return dest;
      }
    }

    return null;
  }
}

Board.ROW_LABELS = ROW_LABELS;
Board.COL_LABELS = COL_LABELS;
