import Chess from '../src/chess';
import Knight from '../src/knight';
import Rook from '../src/rook';
import getGame from './helper';

const assert = require('assert');


describe('chess', () => {
  describe('A new game', () => {
    it('should serialize to the initial state', () => {
      assert.equal(getGame().persistGame(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('should accept moves', () => {
      const game = getGame();
      return game.move('b1', 'a3').then(() => {
        assert.equal(game.persistGame(), 'rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b KQkq - 0 1');
      });
    });
  });

  describe('buildPiece', () => {
    it('builds the right piece in the right color', () => {
      const whiteKnight = Chess.buildPiece('N');
      const blackRook = Chess.buildPiece('r');

      assert.equal(whiteKnight.constructor, Knight);
      assert.equal(whiteKnight.getColor(), 'white');

      assert.equal(blackRook.constructor, Rook);
      assert.equal(blackRook.getColor(), 'black');
    });
  });

  describe('en passant', () => {
    context('when a pawn moves into position', () => {
      // PENDING - this is less important than getting check/checkmate working
      // it('includes "en passant" in the list of valid moves'); //, () => {
      //   const INITIAL_STATE = 'rnbqkbnr/pppppppp/8/3P4/8/N7/PPP1PPPP/R1BQKBNR b KQkq - 0 1';
      //   const game = new Chess(INITIAL_STATE);
      //   const space = game.getSpace('d5');
      //   const piece = space.getPiece();
      //   assert.equal(piece.getLabel(), 'P');
      //   assert.equal(game.move('c7', 'c5'), true);
      //   assert.deepEqual(game.getMoves('d5').sort(), ['c6', 'd6']);
      // });
    });
  });

  describe('check', () => {
    it('knows when the king is in check', () => {
      const game = getGame('rnb1kbnr/ppp2ppp/2q5/3pp3/2KP1B2/8/PPP1PPPP/RN1Q1BNR b KQkq - 0 1');
      assert(game.playerIsInCheck('white'));
    });

    it('prevents the king from moving into check', () => {
      const game = getGame({ d3: 'K', d5: 'k' });
      return game.move('d3', 'd4').then(() => {
        assert.fail('King was allowed to move into check');
      }, (err) => {
        assert.ok(`King was prevented from moving into check: ${err}`);
      });
    });
  });

  describe('checkMate', () => {
    it('correctly reports checkmate');
  });

  describe('draws', () => {
    it('correctly reports draws');
  });

  describe('Knight', () => {
    context('starting position', () => {
      it('produces the right moves', () => {
        assert.deepEqual(getGame().getMoves('b1').sort(), ['a3', 'c3']);
      });
    });

    context('from the middle of the board', () => {
      it('produces the right moves', () => {
        const game = getGame({ d4: 'N' });
        assert.deepEqual(game.getMoves('d4').sort(), ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']);
      });
    });
  });
});
