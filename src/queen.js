import Piece from './piece';

export default class Queen extends Piece {
  static deltas() {
    return Bishop.deltas().concat(Rook.deltas());
  }
  getMovableSpaces(space, board) {
    return Rook.prototype.getSlideMoves.call(this, space, board, Queen.deltas());
  }
}
