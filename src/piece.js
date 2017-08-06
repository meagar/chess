export default class Piece {

  constructor(ch) {
    this.ch = ch;
  }

  getColor() {
    return (this.ch.toUpperCase() === this.ch) ? 'white' : 'black';
  }

  getOppositeColor() {
    return (this.ch.toUpperCase() === this.ch) ? 'black' : 'white';
  }

  black() { return this.getColor() === 'black'; }
  white() { return this.getColor() === 'white'; }

  getLabel() { return this.ch; }

  getMoves(space, board) {
    return this.getMovableSpaces(space, board).map(s => s.label);
  }

  // Return a list of all valid moves for the given piece, from the given space, on the given board
  getMovableSpaces(space, board) {
    throw new Error('getMovableSpace called on Piece, override this in base class');
  }
}
