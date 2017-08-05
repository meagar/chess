import Chess from '../src/chess';
import getGame from './helper'
var assert = require('assert');

describe('Knight', () => {
  context('starting position', () => {
    it('produces the right moves', () => {
      const space = getGame().getSpace('b1');
      const piece = space.getPiece();
      assert.equal(space.getLabel(), 'b1');
      assert.equal(piece.getLabel(), 'N');
      assert.equal(piece.getColor(), 'white');
      assert.deepEqual(getGame().getMoves(space).sort(), ['a3', 'c3']);
    });
  })

  context('from the middle of the board', () => {
    it('produces the right moves', () => {
      const game = getGame({d4: 'N'});
      const space = game.getSpace('d4');
      assert.equal(space.piece.ch, 'N');
      assert.deepEqual(game.getMoves('d4').sort(), ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5'])
    })
  });
});
