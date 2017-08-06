import Chess from '../src/chess';
import Board from '../src/board';

const assert = require('assert');

describe('board', () => {
  function getBoard() {
    const game = new Chess();
    game.newGame();
    return game.board;
  }

  describe('#eachSpace', () => {
    it('iterates over all the spaces, in order', () => {
      let spaces = 0;
      let labels = '';

      getBoard().eachSpace((space, label) => { spaces += 1; labels += label; });

      assert.equal(spaces, 64);
      assert.equal(labels, 'a8b8c8d8e8f8g8h8a7b7c7d7e7f7g7h7a6b6c6d6e6f6g6h6a5b5c5d5e5f5g5h5' +
        'a4b4c4d4e4f4g4h4a3b3c3d3e3f3g3h3a2b2c2d2e2f2g2h2a1b1c1d1e1f1g1h1');
    });
  });

  describe('#eachPiece', () => {
    describe('with a color', () => {
      it('iterates over all the pieces of the given color', () => {
        const board = getBoard();

        let pieces = '';
        board.eachPiece('white', (piece) => { pieces += piece.ch; });
        assert.equal(pieces, 'PPPPPPPPRNBQKBNR');

        pieces = '';
        board.eachPiece('black', (piece) => { pieces += piece.ch; });
        assert.equal(pieces, 'rnbqkbnrpppppppp');
      });
    });

    describe('without a color', () => {
      it('iteates over all pieces', () => {
        let pieces = '';
        getBoard().eachPiece((piece) => { pieces += piece.ch; });
        assert.equal(pieces, 'rnbqkbnrppppppppPPPPPPPPRNBQKBNR');
      });
    });
  });

  describe('#findKing', () => {
    it('finds the right space for the given color', () => {
      const board = getBoard();
      assert.equal(board.findKing('white').getLabel(), 'e1');
      assert.equal(board.findKing('black').getLabel(), 'e8');
    });
  });
});
