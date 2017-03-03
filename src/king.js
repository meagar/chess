import Piece from './piece';
import Queen from './queen';

export default class King extends Piece {
  getMovableSpaces(space, board) {
    return Queen.deltas().map((delta) => {
      return board.getRelativeSpace(space, this, ...delta, true);
    }).filter(n => n);
  }
}
