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
  let hash = '<unknown>';
  let options;
  try {
    options = ʎɐɹɔosǝʌɹǝs;
  } catch {
    console.error(
      'The entry for anypack-plugin-serve was included in your build, but it does not appear that the plugin was. Please check your configuration.',
    );
    return;
  }

  try {
    hash = __webpack_hash__;
  } catch {
    console.error('The entry does not contain __webpack_hash__');
    return;
  }

  // Initialize overlay singleton
  if (!window.anypackOverlay) {
    const { init } = require('anypack-overlay');

    window.anypackOverlay = init();
    window.anypackOverlay.silent = !!options?.client?.silent;
  }

  // Start client
  const Compiler = require('./lib/client/Compiler.js');
  const compiler = new Compiler(options, hash);

  window.anypackOverlay.addCompiler(compiler);
})();
