const webpack = require('webpack');
const rspack = require('@rspack/core');
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

async function startWatcher(config, implementation) {
  const deferred = defer();

  const serve = findServe(config);

  let watchCallback = deferred.resolve;
  if (serve) {
    watchCallback = () => {};
    serve.on('listening', deferred.resolve);
  }

  const compiler = implementation(config);
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

async function startWebpackWatcher(config) {
  return startWatcher(config, webpack);
}

async function startRspackWatcher(config) {
  return startWatcher(config, rspack);
}

module.exports = {
  startWatcher(config) {
    return startWebpackWatcher(config);
  },
  startWebpackWatcher,
  startRspackWatcher,
};
