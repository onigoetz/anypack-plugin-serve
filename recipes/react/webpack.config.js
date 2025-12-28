const { resolve } = require('node:path');

const { AnypackPluginServe } = require('anypack-plugin-serve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const watch = process.env.NODE_ENV === 'development';
const outputPath = resolve(__dirname, 'dist');

module.exports = {
  entry: ['./src/index.js', 'anypack-plugin-serve/client'],
  mode: process.env.NODE_ENV,
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    path: outputPath,
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ReactRefreshPlugin({
          overlay: false
        }),
    new AnypackPluginServe({
      // note: this value is true by default
      hmr: true,
      historyFallback: true,
      static: [outputPath],
    })
  ],
  watch
};
