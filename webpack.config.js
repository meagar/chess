var path = require('path');

module.exports = {
  entry: './src/chess.js',
  output: {
    filename: 'chess.js',
    path: path.resolve(__dirname, '../vue-chess/static/')
  }
};

