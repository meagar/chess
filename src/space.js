import Chess from './chess';

export default class Space {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.x = Chess.COL_LABELS.indexOf(col);
    this.y = Chess.ROW_LABELS.indexOf(row);

    this.label = `${col}${row}`;
    this.piece = null;

    this.color = ((this.x + (this.y % 2)) % 2) ? 'black' : 'white';
  }

  isEmpty() {
    return !this.piece;
  }

  isUnderThreat(board) {
    const attackingSpace = board.getSpaces().find((space) => {
      let piece = space.getPiece();

      if (piece && piece.getMoves(space, board).indexOf(this.label) !== -1) {
        console.log("piece", piece)
        return true
      } else {
        return false
      }
    });

    return !!attackingSpace;
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
