const https = require('node:https');
const fs = require('node:fs');
const { resolve, join } = require('node:path');
const http2 = require('node:http2');

const webpack = require('webpack');
const { test, expect, afterEach } = require('@rstest/core');
const fetch = require('node-fetch');
const defer = require('p-defer');

const { WebpackPluginServe } = require('../lib');

const { getPort } = require('./helpers/port');
const webpackDefaultConfig = require('./fixtures/https/webpack.config');

const httpsFixturePath = resolve(__dirname, './fixtures/https');

const startServe = async (serve) => {
  const deferred = defer();
  const compiler = webpack({
    ...webpackDefaultConfig,
    plugins: [serve],
  });
  const watcher = compiler.watch({}, () => {});
  serve.on('listening', deferred.resolve);
  await deferred.promise;
  return watcher;
};

const checkHttpsServed = async (serve, port) => {
  const watcher = await startServe(serve);
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  const response = await fetch(`https://localhost:${port}`, { agent });
  watcher.close();
  expect(response.ok).toBeTruthy();
};

const checkHttp2Served = async (serve, port) => {
  const watcher = await startServe(serve);
  const deferred = defer();
  const client = http2.connect(`https://localhost:${port}`, {
    rejectUnauthorized: false,
  });
  client.on('error', (err) => {
    deferred.reject(err);
  });

  const req = client.request({ ':path': '/' });
  req.on('response', () => {
    expect(true).toBeTruthy();
    watcher.close();
    client.close();
    deferred.resolve();
  });
  req.on('end', () => {
    client.close();
    deferred.resolve();
  });

  await deferred.promise;
};

afterEach(async () => {
  // remove build output
  await fs.promises.rm('./test/fixtures/https/output', {
    recursive: true,
    force: true,
  });
});

test('should start https with pem', async () => {
  const port = await getPort();
  const key = fs.readFileSync(join(httpsFixturePath, 'localhost.key'));
  const cert = fs.readFileSync(join(httpsFixturePath, 'localhost.crt'));
  const serve = new WebpackPluginServe({
    host: 'localhost',
    allowMany: true,
    port,
    waitForBuild: true,
    https: { key, cert },
  });

  await checkHttpsServed(serve, port);
});

test('should start http2 with pem', async () => {
  const port = await getPort();
  const key = fs.readFileSync(join(httpsFixturePath, 'localhost.key'));
  const cert = fs.readFileSync(join(httpsFixturePath, 'localhost.crt'));
  const serve = new WebpackPluginServe({
    host: 'localhost',
    allowMany: true,
    port,
    waitForBuild: true,
    http2: { key, cert },
  });

  await checkHttp2Served(serve, port);
});

test('should start https with pfx', async () => {
  const port = await getPort();
  const pfx = fs.readFileSync(join(httpsFixturePath, 'localhost.pfx'));
  const serve = new WebpackPluginServe({
    host: 'localhost',
    allowMany: true,
    port,
    waitForBuild: true,
    https: { pfx, passphrase: 'password' },
  });

  await checkHttpsServed(serve, port);
});

test('should start http2 with pfx', async () => {
  const port = await getPort();
  const pfx = fs.readFileSync(join(httpsFixturePath, 'localhost.pfx'));
  const serve = new WebpackPluginServe({
    host: 'localhost',
    allowMany: true,
    port,
    waitForBuild: true,
    http2: { pfx, passphrase: 'password' },
  });

  await checkHttp2Served(serve, port);
});
