const { resolve } = require('node:path');

const { getPort } = require('../../helpers/port');

const { AnypackPluginServe: Serve } = require('../../../lib/');

module.exports = {
  context: __dirname,
  entry: ['./app.js', 'anypack-plugin-serve/client'],
  mode: 'development',
  output: {
    filename: './output.js',
    path: resolve(__dirname, './output'),
    publicPath: 'output/',
  },
  plugins: [
    new Serve({
      headers: {
        'X-Superhero': 'batman',
      },
      host: 'localhost',
      port: getPort(),
    }),
  ],
  resolve: {
    alias: {
      'anypack-plugin-serve/client': resolve(__dirname, '../../../client'),
    },
  },
  watch: true,
};
