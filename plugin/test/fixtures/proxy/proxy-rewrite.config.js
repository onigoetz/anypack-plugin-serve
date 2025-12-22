const { resolve } = require('node:path');

const { WebpackPluginServe: Serve } = require('../../../lib/');

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
      log: { level: logLevel },
      port: 55557,
      middleware: (app, builtins) => {
        app.use(
          builtins.proxy('/api', {
            logLevel,
            target: 'http://localhost:8889',
            pathRewrite: { '^/api': '' },
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
