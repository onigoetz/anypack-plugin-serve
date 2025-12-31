/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const EventEmitter = require('node:events');
const { existsSync } = require('node:fs');
const { join } = require('node:path');
const colors = require('ansi-colors');

const globby = require('tinyglobby');
const { customAlphabet } = require('nanoid');

const { init: initHmrPlugin } = require('./plugins/hmr');
const { init: initRamdiskPlugin } = require('./plugins/ramdisk');
const { forceError, getLogger } = require('./log');
const { start } = require('./server');
const { validate } = require('./validate');

const defaults = {
  // leave `client` undefined
  // client: null,
  compress: null,
  headers: null,
  historyFallback: false,
  hmr: true,
  host: null,
  liveReload: false,
  log: { level: 'info' },
  middleware: () => {},
  open: false,
  port: 55555,
  progress: true,
  publicPath: null,
  ramdisk: false,
  secure: false,
  static: null,
  status: true,
};

const key = 'anypack-plugin-serve';
const nanoid = customAlphabet('1234567890abcdef', 7);

let instance = null;

class AnypackPluginServe extends EventEmitter {
  constructor(opts = {}) {
    super();

    const valid = validate(opts);

    if (valid.error) {
      forceError(
        'An option was passed to AnypackPluginServe that is not valid',
      );
      throw valid.error;
    }

    // NOTE: undocumented option. this is used primarily in testing to allow for multiple instances
    // of the plugin to be tested within the same context. If you find this, use this at your own
    // peril.
    /* istanbul ignore if */
    if (!opts.allowMany && instance) {
      instance.log.error(
        'Duplicate instances created. Only the first instance of this plugin will be active.',
      );
      return;
    }

    instance = this;

    const options = Object.assign({}, defaults, opts);

    if (options.compress === true) {
      options.compress = {};
    }

    if (options.historyFallback === true) {
      options.historyFallback = {};
    }

    // if the user has set this to a string, rewire it as a function
    // host and port are setup like this to allow passing a function for each to the options, which
    // returns a promise
    if (typeof options.host === 'string') {
      const { host } = options;
      options.host = Promise.resolve(host);
    }

    if (Number.isInteger(options.port)) {
      const { port } = options;
      options.port = Promise.resolve(port);
    }

    if (!options.static) {
      options.static = [];
    } else if (options.static.glob) {
      const { glob, options: globOptions = {} } = options.static;
      options.static = globby
        .globSync(glob, globOptions)
        .map((path) => path.replace(/\/$/, ''));
    }

    this.log = getLogger(options.log || {});
    this.options = options;
    this.compilers = [];
    this.state = {};
  }

  apply(compiler) {
    this.compiler = compiler;

    // only allow once instance of the plugin to run for a build
    /* istanbul ignore if */
    if (instance !== this) {
      return;
    }

    this.hook(compiler);
  }

  attach() {
    const self = this;
    const result = {
      apply(compiler) {
        return self.hook(compiler);
      },
    };
    return result;
  }

  // #138. handle emitted events that don't have a listener registered so they can be sent via WebSocket
  emit(eventName, ...args) {
    const listeners = this.eventNames();

    if (listeners.includes(eventName)) {
      super.emit(eventName, ...args);
    } else {
      // #144. don't send the watchClose event to the client
      if (eventName === 'close') {
        return;
      }
      const [data] = args;
      super.emit('unhandled', { eventName, data });
    }
  }

  hook(compiler) {
    const { done, invalid, watchClose, watchRun } = compiler.hooks;

    if (!compiler.wpsId) {
      compiler.wpsId = nanoid();
    }

    if (!compiler.name && !compiler.options.name) {
      compiler.options.name = this.compilers.length.toString();
      this.compilers.push(compiler);
    }

    if (this.options.hmr) {
      initHmrPlugin(compiler, this.log);
    }

    if (this.options.ramdisk) {
      initRamdiskPlugin.call(this, compiler, this.options.ramdisk);
    }

    if (!this.options.static.length) {
      this.options.static.push(compiler.context);
    }

    // check static paths for publicPath. #100
    const publicPath =
      this.options.publicPath === null
        ? compiler.options.output.publicPath
        : this.options.publicPath;
    if (publicPath) {
      let foundPath = false;
      for (const path of this.options.static) {
        const joined = join(path, publicPath);
        if (existsSync(joined)) {
          foundPath = true;
          break;
        }
      }

      /* istanbul ignore next */
      if (!foundPath) {
        this.log.warn(
          `${colors.bold.yellow('Warning')} The value of ${colors.yellow('`publicPath`')} was not found on the filesystem in any static paths specified\n`,
        );
      }
    }

    // we do this emit because webpack caches and optimizes the hooks, so there's no way to detach
    // a listener/hook.
    done.tap(key, (stats) => this.emit('done', stats, compiler));
    invalid.tap(key, (filePath) => this.emit('invalid', filePath, compiler));
    watchClose.tap(key, () => this.emit('close', compiler));

    if (this.options.waitForBuild) {
      // track the first build of the bundle
      this.state.compiling = new Promise((resolve) => {
        this.once('done', () => resolve());
      });

      // track subsequent builds from watching
      this.on('invalid', () => {
        /* istanbul ignore next */
        this.state.compiling = new Promise((resolve) => {
          this.once('done', () => resolve());
        });
      });
    }

    watchRun.tapPromise(key, async () => {
      if (!this.state.starting) {
        // ensure we're only trying to start the server once
        this.state.starting = start.bind(this)();
      }

      // wait for the server to startup so we can get our client connection info from it
      await this.state.starting;

      const compilerData = {
        // only set the compiler name if we're dealing with more than one compiler. otherwise, the
        // user doesn't need the additional feedback in the console
        compilerName: this.compilers.length > 1 ? compiler.options.name : null,
        wpsId: compiler.wpsId,
      };

      const defineObject = Object.assign({}, this.options, compilerData);
      const defineData = { ʎɐɹɔosǝʌɹǝs: JSON.stringify(defineObject) };
      const definePlugin = new compiler.webpack.DefinePlugin(defineData);

      definePlugin.apply(compiler);

      if (this.options.progress) {
        const progressPlugin = new compiler.webpack.ProgressPlugin(
          (percent, message, misc) => {
            // pass the data onto the client raw. connected sockets may want to interpret the data
            // differently
            this.emit('progress', { percent, message, misc }, compiler);
          },
        );

        progressPlugin.apply(compiler);
      }
    });
  }
}

module.exports = { defaults, AnypackPluginServe };
