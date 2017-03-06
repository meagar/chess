import Piece from './piece';

export default class Pawn extends Piece {
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