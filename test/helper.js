import Chess from '../src/chess';
import Board from '../src/board';

// Usage:
// getGame() => new board in the default "new game" state
// getGame('empty') => new empty board
// getGame({d3: N, a1: p, ...}) => new board with the given pieces at the given locations
// getGame(FEN string) => new game in the given state
exports.getGame = function (state) {
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
      game.setPiece(key, state[key]);
    });
  } else {
    throw new Error('Invalid argument to getGame');
  }

  return game;
};

// Turns labels ('d3') into coords([3, 5]) for both input and output
// Returns a list of moves in the form ['a3', 'b4', 'd4c'] etc, where 'c' denotes a capture
// Move labels are always returned in sorted order
exports.getMoves = function (game, spaceLabel) {
  const moves = game.getMoves(spaceLabel);
  return moves.map((move) => {
    return Board.coordsToLabel(move.x, move.y) + (move.capture ? 'c' : '');
  }).sort();
};
