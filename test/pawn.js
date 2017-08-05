import Chess from '../src/chess';
var assert = require('assert');

describe('Pawn', () => {
  function getGame(state) {
    const game = new Chess();
    game.newGame();
    if (state) game.restoreGame(state);
    return game;
  }

  describe('starting position', () => {
    context('when the way is clear', () => {
      it('should be able to move one or two spaces', () => {
        assert.deepEqual(getGame().getMoves('e2'), ['e3','e4'])
      });
    });

    context('when the way is blocked', () => {
      it('should return no moves', () => {
        // Make sure we don't allow the pawn to jump another piece
        const game = getGame('rnbqkbnr/pppp1ppp/8/8/8/4p3/PPPPPPPP/RNBQKBNR b KQkq - 0 1');
        assert.deepEqual(game.getMoves('e2'), []);
      });
    });
  });
});
