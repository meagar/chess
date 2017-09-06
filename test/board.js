import Chess from '../src/chess';
import Board from '../src/board';

const assert = require('assert');

describe('board', () => {
  function strToArr(str) {
    return str.split('').map(x => (x === ' ' ? null : x));
  }

  function blankBoard() {
    const NEW_BOARD = strToArr('rnbqkbnrpppppppp                                PPPPPPPPRNBQKBNR');
    return new Board(NEW_BOARD);
  }

  describe('#coordsToLabel', () => {
    it('Returns the right label', () => {
      const TESTS = { a8: [0, 0], d6: [3, 2], f1: [5, 7], h1: [7, 7] };
      const board = new Board();
      Object.keys(TESTS).forEach((label) => {
        assert.equal(Board.coordsToLabel(...TESTS[label]), label);
      });
    });
  });

  describe('#labelToCoords', () => {
    it('Returns the right coords', () => {
      const TESTS = { a8: [0, 0], d6: [3, 2], f1: [5, 7], h1: [7, 7] };
      const board = new Board();
      Object.keys(TESTS).forEach((label) => {
        assert.deepEqual(Board.labelToCoords(label), TESTS[label]);
      });
    });
  });

  describe('#getSpace', () => {
    it('returns the right space', () => {
      const board = blankBoard();
      assert.equal(board.getSpace(3, 0), 'q');
      assert.equal(board.getSpace(4, 0), 'k');
      assert.equal(board.getSpace(2, 1), 'p');
      assert.equal(board.getSpace(6, 6), 'P');
      assert.equal(board.getSpace(3, 7), 'Q');
      assert.equal(board.getSpace(4, 7), 'K');
    });
  });

  describe('#setSpace', () => {
    it('sets the space to the given piece', () => {
      const board = blankBoard();
      board.setSpace(0, 0, 'p');
      assert.equal(board.getSpace(0, 0), 'p');
      assert.deepEqual(board.getSpaces(), strToArr('pnbqkbnrpppppppp                                PPPPPPPPRNBQKBNR'));
      board.setSpace(5, 5, 'n');
      assert.deepEqual(board.getSpaces(), strToArr('pnbqkbnrpppppppp                             n  PPPPPPPPRNBQKBNR'));
    });
  });

  describe('#isWhite', () => {
    it('returns true for white pieces', () => {
      assert.equal(Board.isWhite('P'), true);
      assert.equal(Board.isWhite('R'), true);
      assert.equal(Board.isWhite('N'), true);
      assert.equal(Board.isWhite('B'), true);
      assert.equal(Board.isWhite('Q'), true);
      assert.equal(Board.isWhite('K'), true);
    });

    it('returns false for black pieces', () => {
      assert.equal(Board.isWhite('p'), false);
      assert.equal(Board.isWhite('r'), false);
      assert.equal(Board.isWhite('n'), false);
      assert.equal(Board.isWhite('b'), false);
      assert.equal(Board.isWhite('q'), false);
      assert.equal(Board.isWhite('k'), false);
    });

    it('raises an error on other values', () => {
      assert.throws(() => { Board.isWhite('f'); });
    });
  });

  describe('a new board', () => {
    function movesToArray(baseMove) {
      const moveCoords = [];
      let move = baseMove;
      while (move) {
        moveCoords.push([move.x, move.y]);
        move = move.next;
      }
      return moveCoords;
    }

    it('has 64 spaces', () => {
      assert.equal(new Board().getSpaces().length, 64);
    });

    context('pieces', () => {
      function moves(label, piece) {
        const board = blankBoard();
        if (piece) {
          board.setSpace(...Board.labelToCoords(label), piece);
        }
        return board.getMovesByLabel(label).reduce((arr, move) => {
          // Turn the moves from a linked list into a flat array
          do {
            arr.push(move);
            move = move.next;
          } while (move);

          return arr;
        }, []).map(move => move.label + (move.capture ? 'c' : '')).sort();
      }

      it('has moves for a pawn', () => {
        assert.deepEqual(moves('d2'), ['c3c', 'd3', 'd4', 'e3c']);
        assert.deepEqual(moves('e7'), ['d6c', 'e5', 'e6', 'f6c']);

        assert.deepEqual(moves('f6', 'P'), ['e7c', 'f7', 'g7c']);
      });

      it('has moves for a rook', () => {
        assert.deepEqual(moves('a1'), ['a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
          'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
        assert.deepEqual(moves('d4', 'r'), ['a4', 'b4', 'c4', 'd1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8',
          'e4', 'f4', 'g4', 'h4']);
        assert.deepEqual(moves('d4', 'R'), ['a4', 'b4', 'c4', 'd1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8',
          'e4', 'f4', 'g4', 'h4']);
      });

      it('has moves for a knight', () => {
        assert.deepEqual(moves('b1'), ['a3', 'c3', 'd2']);
        assert.deepEqual(moves('g1'), ['e2', 'f3', 'h3']);
        assert.deepEqual(moves('e5', 'n'), ['c4', 'c6', 'd3', 'd7', 'f3', 'f7', 'g4', 'g6']);
        assert.deepEqual(moves('e5', 'N'), ['c4', 'c6', 'd3', 'd7', 'f3', 'f7', 'g4', 'g6']);
      });

      it('has moves for a bishop', () => {
        assert.deepEqual(moves('c1'), ['a3', 'b2', 'd2', 'e3', 'f4', 'g5', 'h6']);
        assert.deepEqual(moves('e6', 'b'), ['a2', 'b3', 'c4', 'c8', 'd5', 'd7', 'f5', 'f7', 'g4', 'g8', 'h3']);
      });

      it('has moves for a queen', () => {
        assert.deepEqual(moves('d1'), ['a1', 'a4', 'b1', 'b3', 'c1', 'c2', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
          'e1', 'e2', 'f1', 'f3', 'g1', 'g4', 'h1', 'h5']);
      });

      it('has moves for a king', () => {
        assert.deepEqual(moves('e1'), ['d1', 'd2', 'e2', 'f1', 'f2']);
        assert.deepEqual(moves('c4', 'k'), ['b3', 'b4', 'b5', 'c3', 'c5', 'd3', 'd4', 'd5']);
        assert.deepEqual(moves('c4', 'K'), ['b3', 'b4', 'b5', 'c3', 'c5', 'd3', 'd4', 'd5']);
      });
    });
  });
});

//
//   describe('#eachSpace', () => {
//     it('iterates over all the spaces, in order', () => {
//       let spaces = 0;
//       let labels = '';
//
//       getBoard().eachSpace((space, label) => { spaces += 1; labels += label; });
//
//       assert.equal(spaces, 64);
//       assert.equal(labels, 'a8b8c8d8e8f8g8h8a7b7c7d7e7f7g7h7a6b6c6d6e6f6g6h6a5b5c5d5e5f5g5h5' +
//         'a4b4c4d4e4f4g4h4a3b3c3d3e3f3g3h3a2b2c2d2e2f2g2h2a1b1c1d1e1f1g1h1');
//     });
//   });
//
//   describe('#eachPiece', () => {
//     describe('with a color', () => {
//       it('iterates over all the pieces of the given color', () => {
//         const board = getBoard();
//
//         let pieces = '';
//         board.eachPiece('white', (piece) => { pieces += piece.ch; });
//         assert.equal(pieces, 'PPPPPPPPRNBQKBNR');
//
//         pieces = '';
//         board.eachPiece('black', (piece) => { pieces += piece.ch; });
//         assert.equal(pieces, 'rnbqkbnrpppppppp');
//       });
//     });
//
//     describe('without a color', () => {
//       it('iteates over all pieces', () => {
//         let pieces = '';
//         getBoard().eachPiece((piece) => { pieces += piece.ch; });
//         assert.equal(pieces, 'rnbqkbnrppppppppPPPPPPPPRNBQKBNR');
//       });
//     });
//   });
//
//   describe('#findKing', () => {
//     it('finds the right space for the given color', () => {
//       const board = getBoard();
//       assert.equal(board.findKing('white').getLabel(), 'e1');
//       assert.equal(board.findKing('black').getLabel(), 'e8');
//     });
//   });
// });
