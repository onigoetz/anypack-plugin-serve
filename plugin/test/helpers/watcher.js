const webpack = require('webpack');
const { onTestFinished } = require('@rstest/core');

const { findServe } = require('./config.js');

const { defer } = require('../../lib/helpers.js');

function finished(compiler) {
  let resolve;
  compiler.hooks.done.tap('test-listener', () => {
    if (resolve) {
      resolve();
    }
  });

  return () => {
    const deferred = defer();
    resolve = deferred.resolve;

    return deferred.promise;
  };
}

async function startWatcher(webpackConfig) {
  const deferred = defer();

  const serve = findServe(webpackConfig);

  let watchCallback = deferred.resolve;
  if (serve) {
    watchCallback = () => {};
    serve.on('listening', deferred.resolve);
  }

  const compiler = webpack(webpackConfig);
  const watcher = compiler.watch({}, watchCallback);

  onTestFinished(async () => {
    await new Promise((resolve) => {
      watcher.close(() => {
        resolve();
      });
    });

    await new Promise((resolve) => {
      compiler.close(() => {
        resolve();
      });
    });
  });

  await deferred.promise;

  return { compiler, watcher, onCompilationDone: finished(compiler) };
}

module.exports = {
  startWatcher,
};
