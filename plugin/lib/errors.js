/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
class AnypackPluginServeError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'AnypackPluginServeError';
  }
}

class PluginExistsError extends AnypackPluginServeError {
  constructor(...args) {
    super(...args);
    this.name = 'PluginExistsError';
    this.code = 'ERR_PLUGIN_EXISTS';
  }
}

class RamdiskPathError extends AnypackPluginServeError {
  constructor(...args) {
    super(...args);
    this.name = 'RamdiskPathError';
    this.code = 'ERR_RAMDISK_PATH';
  }
}

module.exports = {
  PluginExistsError,
  RamdiskPathError,
  AnypackPluginServeError,
};
