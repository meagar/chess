import Board from './board';
import Move from './move';

export default class PawnMove extends Move {
  constructor(x, y, prev, capture) {
    super(x, y, prev);

    // When true, this move is a diagonal capture
    // When false, this move is an orthogonal advance of 1 or 2 spaces
    this.capture = capture;

    // When true, this move requires selection of a piece to promote to
    this.promotion = (y === 0 || y === 7);
  }

  setNext(next) {
    this.next = next;
    next.prev = this;
  }

  setPrev(prev) {
    prev.setNext(this);
  }
}
