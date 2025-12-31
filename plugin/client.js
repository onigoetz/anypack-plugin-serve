/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/

/**
 * @note This file exists merely as an easy reference for folks adding it to their configuration entries
 */

(() => {
  const { run } = require('./lib/client/client.js');
  let hash = '<unknown>';
  let options;
  try {
    options = ʎɐɹɔosǝʌɹǝs;
  } catch (_e) {
    const { log } = require('./lib/client/log.js');
    log.error(
      'The entry for anypack-plugin-serve was included in your build, but it does not appear that the plugin was. Please check your configuration.',
    );
  }

  try {
    hash = __webpack_hash__;
  } catch (_e) {}

  run(hash, options);
})();
