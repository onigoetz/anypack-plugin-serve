const { resolve } = require('node:path');

const { AnypackPluginServe } = require('anypack-plugin-serve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');

const isDev = process.env.NODE_ENV === 'development';
const outputPath = resolve(__dirname, 'dist');

module.exports = {
  entry: ['./src/index.js', 'anypack-plugin-serve/client'],
  mode: isDev ? 'development' : 'production',
  watch: isDev,
  devtool: isDev ? 'eval-source-map' : 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
              transform: {
                react: {
                  development: isDev,
                  refresh: isDev,
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        type: 'javascript/auto',
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    path: outputPath,
    publicPath: '/',
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ReactRefreshPlugin({
      overlay: false,
    }),
    new AnypackPluginServe({
      port: 3000,
      host: 'localhost',
      // note: this value is true by default
      hmr: true,
      historyFallback: true,
      static: [outputPath],
    }),
  ],
};
