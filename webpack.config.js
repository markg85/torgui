const path = require('path');

module.exports = {
  entry: './js/modules.js',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: './',
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: './js/bundle.js',
    //path: path.resolve(__dirname, 'js/')
  }
};
