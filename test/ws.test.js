const { test, expect } = require('@rstest/core');
const Koa = require('koa');
const router = require('koa-route');
const defer = require('../lib/helpers.js').defer;
const WebSocket = require('ws');

const { middleware } = require('../lib/ws');

const { getPort } = require('./helpers/port');

test('websocket middleware', async () => {
  const app = new Koa();
  const port = await getPort();
  const uri = `ws://localhost:${port}/test`;
  const routeDeferred = defer();
  const resultDeferred = defer();

  app.use(middleware);
  app.use(
    router.get('/test', async (ctx) => {
      expect(ctx.ws).toBeTruthy();

      const socket = await ctx.ws();

      expect(socket).toBeTruthy();
      routeDeferred.resolve();
    }),
  );

  const server = app.listen(port);

  await new Promise((r, f) => {
    server.on('listening', r);
    server.on('error', f);
  });

  const socket = new WebSocket(uri);

  socket.on('open', async () => {
    await routeDeferred.promise;
    socket.close();
    resultDeferred.resolve();
  });

  await resultDeferred.promise;
});
