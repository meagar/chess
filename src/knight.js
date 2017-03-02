import Piece from './piece';

export default class Knight extends Piece {
  getMovableSpaces(space, board) {
    const deltas = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
    return deltas.map(delta => board.getRelativeSpace(space, this, ...delta, true)).filter(s => s);
  }
}
