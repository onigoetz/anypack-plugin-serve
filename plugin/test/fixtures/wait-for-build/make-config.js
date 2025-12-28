const { resolve } = require('node:path');

const { AnypackPluginServe: Serve } = require('../../../lib/');

const make = (port) => {
  const outputPath = resolve(__dirname, './output/output.js');
  const serve = new Serve({
    host: 'localhost',
    port,
    waitForBuild: true,
    middleware: (app) => {
      app.use(async (req, res, next) => {
        if (req.url === '/test') {
          try {
            require(outputPath);
            res.end('success');
          } catch (_e) {
            res.end('error');
          }
        }
        await next();
      });
    },
  });

  const config = {
    context: __dirname,
    entry: ['./app.js'],
    mode: 'development',
    output: {
      filename: './output.js',
      path: resolve(__dirname, './output'),
      publicPath: 'output/',
      libraryTarget: 'commonjs2',
    },
    plugins: [serve],
    target: 'node',
    watch: true,
  };

  return { serve, config };
};

module.exports = { make };
