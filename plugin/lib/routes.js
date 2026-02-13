/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const { unstyle } = require('ansi-colors');
const stringify = require('json-stringify-safe');

function registerEvent(ee, socket, event, handler) {
  ee.on(event, handler);

  socket.on('close', () => {
    ee.removeListener(event, handler);
  });
}

const setupRoutes = function setupRoutes() {
  const { app, options } = this;

  let buildDone = false;
  this.on('build', () => {
    buildDone = false;
  });
  this.on('done', () => {
    buildDone = true;
  });

  const connect = async (req, _res) => {
    if (req.ws) {
      const socket = await req.ws();
      let lastHash = null;
      const send = (action, data) => {
        if (socket.readyState !== 1) {
          return;
        }
        socket.send(stringify({ action, data }));
      };

      registerEvent(
        this,
        socket,
        'build',
        (compilerName = '<unknown>', { wpsId }) => {
          send('build', { compilerName, wpsId });
        },
      );

      registerEvent(this, socket, 'done', (stats, { wpsId }) => {
        const { hash } = stats;

        if (lastHash === hash) {
          return;
        }

        send('done', { hash, wpsId });

        lastHash = hash;

        if (stats.hasErrors() || stats.hasWarnings()) {
          const renderedStats = stats.toJson('errors-warnings');
          const { errors = [], warnings = [] } = renderedStats;

          send('problems', {
            hash,
            wpsId,
            errors: errors.slice(0).map((e) => unstyle(e)),
            warnings: warnings.slice(0).map((e) => unstyle(e)),
          });

          if (errors.length) {
            return;
          }
        }

        if (options.hmr || options.liveReload) {
          const action = options.liveReload ? 'reload' : 'replace';
          send(action, { hash, wpsId });
        }
      });

      registerEvent(
        this,
        socket,
        'invalid',
        (filePath = '<unknown>', compiler) => {
          const context =
            compiler.context || compiler.options.context || process.cwd();
          const fileName = filePath?.replace?.(context, '') || filePath;
          const { wpsId } = compiler;

          send('invalid', { fileName, wpsId });
        },
      );

      registerEvent(this, socket, 'progress', (data) => {
        send('progress', data);
      });

      // #138. handle emitted events that don't have a listener registered, and forward the message
      // onto the client via the socket
      registerEvent(this, socket, 'unhandled', ({ eventName, data }) => {
        send(eventName, data);
      });

      send('connected', { buildDone });
    }
  };

  app.get('/wps', connect);
};

module.exports = { setupRoutes };
