#!/usr/bin/env node

/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const colors = require('ansi-colors');
const importLocal = require('import-local');
const parse = require('yargs-parser');
const rspack = require('@rspack/core');

const pkg = require('../package.json');
const { run } = require('../lib/compiler');
const { loadConfig } = require('../lib/config');

const { error: stderr } = console;
const end = () => process.exit(0);

const help = `
  ${pkg.description}

  ${colors.underline('Usage')}
    $ rp [...options]

  ${colors.underline('Options')}
    --config          A path to a rspack config file
    --config.{name}   A path to a rspack config file, and the config name to run
    --json            Emit bundle information as JSON
    --help            Displays this message
    --silent          Instruct the CLI to produce no console output
    --version         Displays rspack-nano and rspack versions

  ${colors.underline('Examples')}
    $ rp
    $ rp --help
    $ rp --config rspack.config.js
    $ rp --config.serve rspack.config.js
`;

const doeet = async () => {
  process.on('SIGINT', end);
  process.on('SIGTERM', end);

  const argv = parse(process.argv.slice(2));
  const logPrefix = {
    ok: colors.blue('⬡ rspack:'),
    whoops: colors.red('⬢ rspack:'),
  };
  const log = {
    error: (...args) => {
      if (argv.silent) return;
      args.unshift(logPrefix.whoops);
      stderr(...args);
    },
    info: (...args) => {
      if (argv.silent) return;
      args.unshift(logPrefix.ok);
      stderr(...args);
    },
  };

  if (argv.help) {
    stderr(help);
    return;
  }

  if (argv.version || argv.v) {
    stderr(`
rspack-nano v${pkg.version}
rspack      v${rspack.version}
`);
    return;
  }

  const config = await loadConfig(argv);
  run(config, log);
};

process.on('unhandledRejection', (err) => {
  stderr(err.stack);
  process.exitCode = 1;
});

// eslint-disable-next-line no-unused-expressions
importLocal(__filename) || doeet();
