import Chess from '../src/chess';
import Piece from '../src/piece';

// Usage:
// getGame() => new board in the default "new game" state
// getGame('empty') => new empty board
// getGame({d3: N, a1: p, ...}) => new board with the given pieces at the given locations
// getGame(FEN string) => new game in the given state
export default function getGame(state) {
  const game = new Chess();
  if (state === undefined) {
    game.newGame();
  } else if (state === 'empty') {
    // no-op
  } else if (typeof(state) == 'string') {
    // FEN string
    game.newGame();
    game.restoreGame(state)
  } else if (typeof(state) == 'object') {
    // key/value pairs
    for (const key of Object.keys(state)) {
      game.getSpace(key).setPiece(Chess.buildPiece(state[key]));
    }
  } else {
    throw 'Invalid argument to getGame'
  }

  return game;
}
