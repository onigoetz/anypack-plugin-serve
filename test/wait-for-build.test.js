const fs = require('node:fs');
const webpack = require('webpack');
const { test, expect, beforeEach, afterEach } = require('@rstest/core');
const fetch = require('node-fetch').default;
const defer = require('p-defer');

const { getPort } = require('./helpers/port');
const { make } = require('./fixtures/wait-for-build/make-config');

let watcher;
let port;

beforeEach(async () => {
  const deferred = defer();
  port = await getPort();
  const { serve, config } = make(port);
  const compiler = webpack(config);
  watcher = compiler.watch({}, () => {});
  serve.on('listening', deferred.resolve);
  await deferred.promise;
});

afterEach(async () => {
  watcher.close();
  await fs.promises.rm('./test/fixtures/waitForBuild/output', {
    recursive: true,
    force: true,
  });
});

test('should wait until bundle is compiled', async () => {
  const response = await fetch(`http://localhost:${port}/test`);
  const text = await response.text();
  expect(text).toEqual('success');
});
