const path = require('node:path');

const { AnypackPluginServe } = require('anypack-plugin-serve');
const importFresh = require('import-fresh');
const nodeExternals = require('webpack-node-externals');

const SRC_DIR_CLIENT = path.resolve(__dirname, 'client');
const SRC_DIR_SERVER = path.resolve(__dirname, 'server');
const DIST_DIR = path.resolve(__dirname, 'dist');

const serve = new AnypackPluginServe({
  port: 3000,
  static: [DIST_DIR],
  waitForBuild: true,
  middleware(app) {
    app.use(async (req, res, next) => {
      if (req.path === '/') {
        const renderer = importFresh(path.resolve(DIST_DIR, 'server.js'));
        await renderer.default(req, res);
      } else {
        next();
      }
    });
  },
});

function babelLoaderOptions(isServer) {
  return {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: isServer
              ? { node: 'current' }
              : '> 0.5%, last 2 versions, not dead',
          },
        ],
        [
          '@babel/preset-react',
          { development: !optimize, runtime: 'automatic' },
        ],
      ],
    },
  };
}

const optimize = process.env.NODE_ENV === 'production';
const mode = optimize ? 'production' : 'development';

module.exports = [
  {
    name: 'client',
    mode,
    entry: {
      client: [
        './client/index.js',
        ...(optimize ? [] : ['anypack-plugin-serve/client']),
      ],
    },
    output: {
      path: DIST_DIR,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [SRC_DIR_SERVER, SRC_DIR_CLIENT],
          use: [babelLoaderOptions(false)],
        },
      ],
    },
    plugins: [serve],
    target: 'web',
    watch: !optimize,
  },
  {
    name: 'server',
    mode,
    entry: { server: './server/main.js' },
    output: {
      path: DIST_DIR,
      filename: '[name].js',
      library: { type: 'commonjs2' },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [SRC_DIR_SERVER, SRC_DIR_CLIENT],
          use: [babelLoaderOptions(true)],
        },
      ],
    },
    plugins: [serve.attach()],
    target: 'node',
    externalsPresets: { node: true },
    externals: [nodeExternals()],
  },
];
