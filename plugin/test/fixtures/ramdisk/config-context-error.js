const { resolve } = require('node:path');

const { getPort } = require('../../helpers/port');

const { WebpackPluginServe: Serve } = require('../../../lib/');

module.exports = {
  context: __dirname,
  entry: ['./app.js', 'anypack-plugin-serve/client'],
  mode: 'development',
  output: {
    filename: './output.js',
    path: __dirname,
    publicPath: 'output/',
  },
  plugins: [
    new Serve({
      host: 'localhost',
      port: getPort(),
      ramdisk: true,
    }),
  ],
  resolve: {
    alias: {
      'anypack-plugin-serve/client': resolve(__dirname, '../../../client'),
    },
  },
  watch: true,
};
