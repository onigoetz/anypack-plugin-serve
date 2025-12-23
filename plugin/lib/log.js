/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const colors = require('ansi-colors');

const symbols = { ok: '⬡', whoops: '⬢' };

/* istanbul ignore next */
const forceError = (...args) => {
  const { error } = console;
  error(colors.red(`${symbols.whoops} aps:`), ...args);
};

function prefix(color, symbol) {
  return colors[color](`${symbol} aps:`);
}

const LOGLEVELS = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  SILENT: 5,
};

function getLogger(options) {
  const CURRENTLEVEL = LOGLEVELS[(options.level ?? 'info').toUpperCase()];

  return {
    warn(...args) {
      if (LOGLEVELS.WARN >= CURRENTLEVEL) {
        console.warn(prefix('yellow', symbols.whoops), ...args);
      }
    },
    error(...args) {
      if (LOGLEVELS.ERROR >= CURRENTLEVEL) {
        console.error(prefix('red', symbols.whoops), ...args);
      }
    },
    info(...args) {
      if (LOGLEVELS.INFO >= CURRENTLEVEL) {
        console.info(prefix('blue', symbols.ok), ...args);
      }
    },
    trace(...args) {
      if (LOGLEVELS.TRACE >= CURRENTLEVEL) {
        console.trace(prefix('cyan', symbols.ok), ...args);
      }
    },
    debug(...args) {
      if (LOGLEVELS.DEBUG >= CURRENTLEVEL) {
        console.debug(prefix('magenta', symbols.ok), ...args);
      }
    },
  };
}

module.exports = { forceError, getLogger };
