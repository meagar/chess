import Chess from '../src/chess';
import getGame from './helper'
var assert = require('assert');

describe('Pawn', () => {
  describe('starting position', () => {
    context('when the way is clear', () => {
      it('should be able to advance two ranks from its starting row', () => {
        assert.deepEqual(getGame().getMoves('c2').sort(), ['c3', 'c4']);
        assert.deepEqual(getGame().getMoves('e2').sort(), ['e3','e4'])
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

  describe('promotion', () => {
    function setupGame() {
      return getGame({f7: 'P', d8: 'k', d1: 'K'})
    }

    context('when the promotion is absent', () => {
      it('raises an error', () => {
        const game = setupGame();

        return game.move('f7', 'f8').then(() => {
          // Success handler should not be called
          assert.fail('success handler was called');
        }, (error) => {
          assert(error.message.match(/promote/));
        });
      })
    })

    context('when the promotion is to Queen', () => {
      it('promots to queen', () => {
        const game = setupGame();
        function promote() {
          return new Promise((resolve) => {
            resolve('q');
          })
        }

        return game.move('f7', 'f8', { promote }).then(() => {
          assert.equal(game.getSpace('f8').getPiece().ch, 'Q');
        })
      })
    })
  });
});
