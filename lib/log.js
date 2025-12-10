/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const colors = require('ansi-colors');
const loglevel = require('loglevelnext');

const symbols = { ok: '⬡', whoops: '⬢' };
const levelToColors = {
  trace: 'cyan',
  debug: 'magenta',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
};

/* istanbul ignore next */
const forceError = (...args) => {
  const { error } = console;
  error(colors.red(`${symbols.whoops} aps:`), ...args);
};

const getLogger = (options) => {
  const prefix = {
    level({ level }) {
      const color = levelToColors[level];
      /* istanbul ignore next */
      const symbol = ['error', 'warn'].includes(level)
        ? symbols.whoops
        : symbols.ok;
      return colors[color](`${symbol} aps: `);
    },
    template: '{{level}}',
  };

  /* istanbul ignore if */
  if (options.timestamp) {
    prefix.template = `[{{time}}] ${prefix.template}`;
  }

  options.prefix = prefix;
  options.name = 'anypack-plugin-serve';

  const log = loglevel.create(options);

  return log;
};

module.exports = { forceError, getLogger };
