/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const defer = require('./helpers.js').defer;
const WebSocket = require('ws');

const socketServer = new WebSocket.Server({ noServer: true });

const middleware = async (req, _res, next) => {
  const { upgrade = '' } = req.headers;
  const upgradable = upgrade
    .split(',')
    .map((header) => header.trim())
    .includes('websocket');

  if (upgradable) {
    const deferred = defer();
    req.ws = async () => {
      socketServer.handleUpgrade(
        req,
        req.socket,
        Buffer.alloc(0),
        deferred.resolve,
      );

      return deferred.promise;
    };
  }

  await next();
};

module.exports = { middleware };
