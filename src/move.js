import Board from './board';

export default class Move {
  constructor(x, y, prev) {
    this.x = x;
    this.y = y;
    this.label = Board.coordsToLabel(x, y);
    if (prev) { this.setPrev(prev); }
  }

  setNext(next) {
    this.next = next;
    next.prev = this;
  }

  setPrev(prev) {
    prev.setNext(this);
  }
}
