const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  externals: [
    nodeExternals(), {
    "redux-logger": "redux-logger",
  }],
  output: {
    path: path.join(__dirname, '/lib'),
    filename: 'index.js',
    library: 'immutable-form',
    libraryTarget: 'umd',
  },
  modulesDirectories: [
    'src',
    'node_modules',
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
    ],
  },
};
