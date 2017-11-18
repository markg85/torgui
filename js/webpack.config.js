module.exports = {
  entry: './modules.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['es2015', 'stage-0']
          }
        }
      }
    ]
  },
  output: {
    filename: 'bundle.js'
  }
};
