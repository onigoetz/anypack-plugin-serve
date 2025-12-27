const timers = require('node:timers/promises');
const { onTestFinished } = require('@rstest/core');
const polka = require('polka');

const defaultRoutes = [
  {
    url: '/api',
    handler: (_req, res) => {
      res.statusCode = 200;
      res.end('/api endpoint');
    },
  },
  {
    url: '/api/test',
    handler: (_req, res) => {
      res.statusCode = 200;
      res.end('/api/test endpoint');
    },
  },
];

function proxyServer(routes = defaultRoutes) {
  const app = polka();

  routes.forEach((route) => {
    app.get(route.url, route.handler);
  });
  return app;
}

async function startProxyServer(port, handlers) {
  const server = proxyServer(handlers).listen(port);

  onTestFinished(async () => {
    await new Promise((resolve) => {
      server.server.close(() => {
        resolve();
      });
    });

    // Server needs a small timeout to finish stopping properly
    await timers.setTimeout(500);
  });

  return { server };
}

module.exports = {
  proxyServer,
  startProxyServer,
};
