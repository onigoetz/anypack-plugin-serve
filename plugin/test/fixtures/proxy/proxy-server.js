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

const proxyServer = (routes = defaultRoutes) => {
  const app = polka();

  routes.forEach((route) => {
    app.get(route.url, route.handler);
  });
  return app;
};

module.exports = {
  proxyServer,
};
