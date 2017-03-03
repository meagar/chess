import Piece from './piece';
import Rook from './rook';

export default class Bishop extends Piece {
  static deltas() { return [[1, 1], [1, -1], [-1, 1], [-1, -1]]; }

  getMovableSpaces(space, board) {
    return Rook.prototype.getSlideMoves.call(this, space, board, Bishop.deltas());
  }
}
