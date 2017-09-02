import Chess from '../src/chess';
import Board from '../src/board';

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
  } else if (typeof state === 'string') {
    // FEN string
    game.newGame();
    game.restoreGame(state);
  } else if (typeof state === 'object') {
    // key/value pairs
    Object.keys(state).forEach((key) => {
      game.setPiece(...Board.labelToCoords(key), state[key]);
    });
  } else {
    throw new Error('Invalid argument to getGame');
  }

  return game;
}
