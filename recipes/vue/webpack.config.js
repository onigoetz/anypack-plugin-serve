const { resolve } = require('path');

const { WebpackPluginServe } = require('anypack-plugin-serve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const mode = process.env.NODE_ENV;
const isDev = mode === 'development';
const outputPath = resolve(__dirname, 'dist');

module.exports = {
  entry: ['./src/index.js', ...(isDev ? ['anypack-plugin-serve/client'] : [])],
  mode,
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      }
    ]
  },
  output: {
    path: outputPath,
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin(),
    ...(isDev
      ? [
          new WebpackPluginServe({
            // note: this value is true by default
            hmr: true,
            historyFallback: true,
            static: [outputPath]
          })
        ]
      : [])
  ],
  watch: isDev
};
