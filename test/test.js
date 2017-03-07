import Chess from '../src/chess';
var assert = require('assert');

describe('chess', () => {
    describe('A new game', () => {
      it('should serialize to the initial state', () => {
      let game = new Chess();
      game.newGame();
      assert.equal(game.persistGame(), game.INITIAL_BOARD);
    });

    it('should correctly produce a list of moves for a knight', () => {
      const game = new Chess();
      game.newGame();
      const space = game.getSpace('b1');
      const piece = space.getPiece();
      assert.equal(space.getLabel(), 'b1');
      assert.equal(piece.getLabel(), 'N');
      assert.equal(piece.getColor(), 'white');
      assert.deepEqual(game.getMoves(space).sort(), ['a3', 'c3']);
    });

    it('should allow a pawn to advance two ranks from its starting location', () => {
      const game = new Chess();
      game.newGame();
      assert.deepEqual(game.getMoves('c2').sort(), ['c3', 'c4']);
    });

    it('should accept moves', () => {
      let game = new Chess();
      game.newGame();
      assert.equal(game.move('b1', 'a3'), true);
      assert.equal(game.persistGame(), 'rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq - 0 1');
    });
  });

  describe('en passant', () => {
    context('when a pawn moves into position', () => {
      it('includes "en passant" in the list of valid moves', () => {
        const INITIAL_STATE = 'rnbqkbnr/pppppppp/8/3P4/8/N7/PPP1PPPP/R1BQKBNR b KQkq - 0 1';
        const game = new Chess(INITIAL_STATE);
        const space = game.getSpace('d5');
        const piece = space.getPiece();
        assert.equal(piece.getLabel(), 'P');
        assert.equal(game.move('c7', 'c5'), true);
        assert.deepEqual(game.getMoves('d5').sort(), ['c6', 'd6']);
      });
    })
  });
});
