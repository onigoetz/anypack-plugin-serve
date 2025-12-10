const { resolve } = require('node:path');

const { getPort } = require('../../helpers/port');

const { WebpackPluginServe: Serve } = require('../../../lib/');

const serve = new Serve({
  host: 'localhost',
  port: getPort(),
});

module.exports = [
  {
    context: __dirname,
    entry: ['./app.js', 'anypack-plugin-serve/client'],
    mode: 'development',
    output: {
      filename: './dist-app.js',
      path: resolve(__dirname, './output'),
      publicPath: 'output/',
      uniqueName: 'app',
    },
    plugins: [serve],
    resolve: {
      alias: {
        'anypack-plugin-serve/client': resolve(__dirname, '../../../client'),
      },
    },
    watch: true,
  },
  {
    context: __dirname,
    entry: ['./worker.js', 'anypack-plugin-serve/client'],
    mode: 'development',
    output: {
      filename: './dist-worker.js',
      path: resolve(__dirname, './output'),
      publicPath: 'output/',
      uniqueName: 'worker',
    },
    plugins: [serve.attach()],
    resolve: {
      alias: {
        'anypack-plugin-serve/client': resolve(__dirname, '../../../client'),
      },
    },
  },
];
