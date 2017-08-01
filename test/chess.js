import Chess from '../src/chess';
var assert = require('assert');

describe('chess', () => {
  describe('A new game', () => {
    function getGame() {
      const game = new Chess()
      game.newGame();
      return game;
    }

    it('should serialize to the initial state', () => {
      assert.equal(getGame().persistGame(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('should correctly produce a list of moves for a knight', () => {
      const space = getGame().getSpace('b1');
      const piece = space.getPiece();
      assert.equal(space.getLabel(), 'b1');
      assert.equal(piece.getLabel(), 'N');
      assert.equal(piece.getColor(), 'white');
      assert.deepEqual(getGame().getMoves(space).sort(), ['a3', 'c3']);
    });

    it('should allow a pawn to advance two ranks from its starting location', () => {
      assert.deepEqual(getGame().getMoves('c2').sort(), ['c3', 'c4']);
    });

    it('should accept moves', () => {
      const game = getGame()
      assert.equal(game.move('b1', 'a3'), true);
      assert.equal(game.persistGame(), 'rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq - 0 1');
    });
  });

  describe('en passant', () => {
    context('when a pawn moves into position', () => {
      // PENDING - this is less important than getting check/checkmate working
      it('includes "en passant" in the list of valid moves') //, () => {
        //   const INITIAL_STATE = 'rnbqkbnr/pppppppp/8/3P4/8/N7/PPP1PPPP/R1BQKBNR b KQkq - 0 1';
        //   const game = new Chess(INITIAL_STATE);
        //   const space = game.getSpace('d5');
        //   const piece = space.getPiece();
        //   assert.equal(piece.getLabel(), 'P');
        //   assert.equal(game.move('c7', 'c5'), true);
        //   assert.deepEqual(game.getMoves('d5').sort(), ['c6', 'd6']);
        // });
      })
    });

    describe ('check', () => {
      it('knows when the king is in check', () => {
        const game = new Chess('rnb1kbnr/ppp2ppp/2q5/3pp3/2KP1B2/8/PPP1PPPP/RN1Q1BNR b KQkq - 0 1');
        //assert.equal(game.getPlayerInCheck(), 'white')
      });

      it('prevents the king from moving into check');
    });

    describe('checkMate', () => {
      it('correctly reports checkmate');
    });

    describe('draws', () => {
      it('correctly reports draws');
    })
  });
