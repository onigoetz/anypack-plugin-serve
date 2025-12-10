/*
  Copyright © 2019 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const fs = require('node:fs');
const childProcess = require('node:child_process');

const colors = require('ansi-colors');

const defaults = {
  blockSize: 512,
  // 256 mb
  bytes: 2.56e8,
  name: 'wpr',
};
const name = 'WebpackPluginRamdisk';

function getCommands() {
  const { platform } = process;

  if (platform === 'darwin') {
    return {
      root: ({ name }) => `/Volumes/${name}`,
      mount: (options) => {
        const result = run(
          'hdiutil',
          'attach',
          '-nomount',
          `ram://${options.blocks}`,
        );

        options.devicePath = result.stdout.toString().trim();

        run('diskutil', 'erasevolume', 'HFS+', name, options.devicePath);
      },
      umount: (options) => {
        // If the disk wasn't unmounted properly on previous run we don't know its device id
        if (!options.devicePath) {
          const all = run('hdiutil', 'info');

          const output = all.stdout
            .toString()
            .split(/\n\r?/g)
            .find((line) => line.endsWith(options.diskPath));

          if (output) {
            options.devicePath = output.split(/\s+/g)[0];
          }
        }

        if (options.devicePath) {
          run('hdiutil', 'detach', options.devicePath);
        }
      },
    };
  }

  if (platform === 'linux') {
    return {
      root: ({ name }) => `/dev/shm/${name}`,
      mount: ({ diskPath }) => {
        run('sudo', 'mkdir', '-p', diskPath);
        run('sudo', 'chmod', '777', diskPath);
      },
      umount: ({ diskPath }) => {
        run('sudo', 'rm', '-rf', diskPath);
      },
    };
  }

  return null;
}

function run(command, ...args) {
  if (!command) {
    return;
  }

  const result = childProcess.spawnSync(command, args);

  if (result.status !== 0) {
    throw new Error(
      `Failed command [${command} ${args.join(' ')}]: ${result.stdout} / ${
        result.stderr
      }`,
    );
  }

  return result;
}

class Ramdisk {
  constructor(opts = {}) {
    const partialOpts = Object.assign({}, defaults, opts);
    const options = Object.assign({}, partialOpts, {
      blocks: partialOpts.bytes / partialOpts.blockSize,
    });

    this.options = options;

    this.commands = getCommands();
    this.options.diskPath = this.commands?.root(this.options);

    // const options = Object.assign({}, opts, { root: commands.root });

    this.init();
  }

  init() {
    if (!fs.existsSync(this.options.diskPath)) {
      console.info(
        colors.blue(`⬡ aps:`),
        `Initializing RAMdisk at ${this.options.diskPath}. You may be prompted for credentials`,
      );
      this.commands?.mount(this.options);
    }

    process.on('SIGINT', () => {
      this.cleanup();
    });

    process.on('SIGTERM', () => {
      this.cleanup();
    });

    process.on('exit', () => {
      this.cleanup();
    });
  }

  get diskPath() {
    return this.options.diskPath;
  }

  cleanup() {
    this.commands?.umount(this.options);
  }
}

module.exports = { defaults, Ramdisk };
