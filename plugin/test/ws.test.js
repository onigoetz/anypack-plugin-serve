const { test, expect } = require('@rstest/core');
const polka = require('polka');
const defer = require('../lib/helpers.js').defer;
const WebSocket = require('ws');

const { middleware } = require('../lib/ws');

const { getPort } = require('./helpers/port');

test('websocket middleware', async () => {
  const app = polka();
  const port = await getPort();
  const uri = `ws://localhost:${port}/test`;
  const routeDeferred = defer();
  const resultDeferred = defer();

  app.use(middleware);
  app.get('/test', async (req, res) => {
    expect(req.ws).toBeTruthy();

    const socket = await req.ws();

    expect(socket).toBeTruthy();
    routeDeferred.resolve();
  });

  const server = app.listen(port);

  await new Promise((r, f) => {
    server.server.on('listening', r);
    server.server.on('error', f);
  });

  const socket = new WebSocket(uri);

  socket.on('open', async () => {
    await routeDeferred.promise;
    socket.close();
    resultDeferred.resolve();
  });

  await resultDeferred.promise;
});
