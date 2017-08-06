var path = require('path');

module.exports = {
  entry: './src/chess.js',
  output: {
    filename: 'chess.js',
    path: path.resolve(__dirname, '../vue-chess/static/')
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      loader: 'eslint-loader',
      exclude: /node_modules/
    }],

  }
};
