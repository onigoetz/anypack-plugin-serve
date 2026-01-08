const { resolve } = require('node:path');

const { AnypackPluginServe: Serve } = require('../../../lib/');

const logLevel = 'silent';

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
      port: 55556,
      log: { level: logLevel },
      middleware: (app, builtins) => {
        app.use(
          builtins.proxy({
            pathFilter: '/api',
            logLevel,
            target: 'http://localhost:8888',
          }),
        );
      },
    }),
  ],
  resolve: {
    alias: {
      'anypack-plugin-serve/client': resolve(__dirname, '../../../lib/client'),
    },
  },
  watch: true,
};
