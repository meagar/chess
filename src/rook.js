import Piece from './piece';

export default class Rook extends Piece {
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
