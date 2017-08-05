import Chess from '../src/chess';
import Piece from '../src/piece';

export default function getGame(state) {
  const game = new Chess();
  if (state === undefined) {
    game.newGame();
  } else if (typeof(state) == 'string') {
    game.newGame();
    game.restoreGame(state)
  } else if (typeof(state) == 'object') {
    Object.keys(state).forEach((key) => {
      game.getSpace(key).setPiece(Chess.buildPiece(state[key]));
    });
  } else {

  }
  return game;
}
