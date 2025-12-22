/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const url = require('node:url');
const { createServer } = require('node:http');

const polka = require('polka');
const open = require('open').default;

const { getBuiltins } = require('./middleware');
const { setupRoutes } = require('./routes');

const select = (options) => {
  const types = {
    http: createServer,
    https: require('node:https').createServer,
    http2: require('node:http2').createServer,
    http2Secure: require('node:http2').createSecureServer,
  };
  const { http2, https } = options;
  let server;
  let secure = false;

  if (http2) {
    if (http2 === true) {
      server = types.http2({});
    } else if (http2.cert || http2.pfx) {
      secure = true;
      server = types.http2Secure(http2);
    } else {
      server = types.http2(http2);
    }
  } else if (https) {
    secure = true;
    server = types.https(https === true ? {} : https);
  } else {
    server = types.http();
  }

  return { secure, server };
};

const start = async function start() {
  if (this.listening) {
    return;
  }

  const { host, middleware, port, waitForBuild } = this.options;

  this.options.host = await host;
  this.options.port = await port;
  const { secure, server } = select(this.options);

  const app = polka({ server });
  this.app = app;

  const builtins = getBuiltins(app, this.options);

  if (waitForBuild) {
    app.use(async (_req, _res, next) => {
      await this.state.compiling;
      await next();
    });
  }

  // allow users to add and manipulate middleware in the config
  await middleware(app, builtins);

  // call each of the builtin middleware. methods are once'd so this has no ill-effects.
  for (const fn of Object.values(builtins)) {
    if (!fn.skip) {
      fn();
    }
  }

  setupRoutes.bind(this)();

  this.options.secure = secure;

  this.app.listen({ host: this.options.host, port: this.options.port });

  // wait for the server to fully spin up before asking it for details
  await new Promise((resolve, reject) => {
    server.on('listening', () => {
      this.emit('listening', server);
      resolve();
    });
    server.on('error', reject);
  });

  this.listening = true;

  const protocol = secure ? 'https' : 'http';
  const address = server.address();

  address.hostname = address.address;

  // fix #131 - server address reported as 127.0.0.1 for localhost
  if (
    address.hostname !== this.options.host &&
    this.options.host === 'localhost'
  ) {
    address.hostname = this.options.host;
  }

  // we set this so the client can use the actual hostname of the server. sometimes the net
  // will mutate the actual hostname value (e.g. :: -> [::])
  this.options.address = url.format(address);

  const uri = `${protocol}://${this.options.address}`;

  this.log.info('Server Listening on:', uri);

  this.once('done', () => {
    if (this.options.open) {
      open(uri, this.options.open === true ? {} : this.options.open);
    }
  });
};

module.exports = { start };
