/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const configTypes = {
  function: (c, argv) => Promise.resolve(c(argv.env || {}, argv)),
  object: (c) => Promise.resolve(c),
};
const cwd = process.cwd();
const defaultConfigPath = resolve(cwd, 'rspack.config.js');

async function loadConfig(argv) {
  if (!argv.config && existsSync(defaultConfigPath)) {
    argv.config = defaultConfigPath;
  }

  // let's not process any config if the user hasn't specified any
  if (argv.config) {
    const configName =
      typeof argv.config === 'string' ? null : Object.keys(argv.config)[0];
    // e.g. --config.batman rspack.config.js
    const configPath = argv.config[configName] || argv.config;
    const resolvedPath = resolve(configPath);

    let configExport = require(resolvedPath);

    if (configExport.default) {
      configExport = configExport.default;
    }

    if (configName) {
      if (!Array.isArray(configExport)) {
        throw new TypeError(
          `A config with name was specified, but the config ${configPath} does not export an Array.`,
        );
      }

      configExport = configExport.find((c) => c.name === configName);

      if (!configExport) {
        throw new RangeError(
          `A config with name '${configName}' was not found in ${configPath}`,
        );
      }
    }

    const configType = typeof configExport;
    const config = await configTypes[configType](configExport, argv);
    const watchConfig = [].concat(config).find((c) => !!c.watch);

    return { config, watchConfig, emitJson: argv.json };
  }

  return { config: {} };
}

module.exports = { loadConfig };
