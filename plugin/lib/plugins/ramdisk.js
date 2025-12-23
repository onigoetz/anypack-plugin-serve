/*
  Copyright © 2018 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const crypto = require('node:crypto');
const fs = require('node:fs');
const process = require('node:process');
const { basename, join, resolve, relative } = require('node:path');

const isCwd = (path) => !relative(path, process.cwd());
const pkg = require('empathic/package');
const { Ramdisk } = require('./ramdisk_lib.js');
const colors = require('ansi-colors');

const { RamdiskPathError } = require('../errors');

const readPkgName = () => {
  const pkgPath = pkg.up();
  // istanbul ignore if
  if (pkgPath == null) {
    return null;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.name;
  } catch (_error) {
    // istanbul ignore next
    return null;
  }
};

module.exports = {
  init(compiler, options) {
    let pkgName = readPkgName();
    const { path } = compiler.options.output;
    const lastSegment = basename(path);
    const errorInfo = `The ramdisk option creates a symlink from \`output.path\`, to the ramdisk build output path, and must remove any existing \`output.path\` to do so.`;

    // if output.path is /batman/batcave, and the user is running the build with wsp from
    // /batman/batcave, then the process will try and delete cwd, which we don't want for a number
    // of reasons
    // console.log('output.path:', resolve(path));
    // console.log('process.cwd:', process.cwd());
    if (isCwd(path)) {
      throw new RamdiskPathError(
        `Cannot remove current working directory. ${errorInfo} Please run from another path, or choose a different \`output.path\`.`,
      );
    }

    // if output.path is /batman/batcave, and the compiler context is not set and cwd is
    // /batman/batcave, or the context is the same as output.path, then the process will try and
    // delete the context directory, which probably contains src, configs, etc. throw an error
    // and be overly cautious rather than let the user do something bad. oddly enough, webpack
    // doesn't protect against context === output.path.
    if (resolve(compiler.context) === resolve(path)) {
      throw new RamdiskPathError(
        `Cannot remove ${path}. ${errorInfo} Please set the \`context\` to a another path, choose a different \`output.path\`.`,
      );
    }

    if (!pkgName) {
      // use md5 for a short hash that'll be consistent between wps starts
      const md5 = crypto.createHash('md5');
      md5.update(path);
      pkgName = md5.digest('hex');
    }

    const newPath = join(pkgName, lastSegment);

    // clean up the output path in prep for the ramdisk plugin
    //compiler.options.output.path = newPath;

    this.log.info(`Ramdisk enabled`);

    const defaultOptions = { name: 'aps' };
    const plugin = new Ramdisk(
      typeof options === 'object'
        ? { ...options, ...defaultOptions }
        : defaultOptions,
    );

    if (
      fs.lstatSync(path, { throwIfNoEntry: false }) ||
      fs.statSync(path, { throwIfNoEntry: false })
    ) {
      console.log('Removing', path);
      fs.rmSync(path, { recursive: true });
    } else {
      console.log('Path does not exist', path);
    }

    const ramdiskPath = join(plugin.diskPath, newPath);

    // We create the path in the ramdisk to link to
    if (!fs.existsSync(ramdiskPath)) {
      fs.mkdirSync(ramdiskPath, { recursive: true });
    }

    // We symlink the target to the ramdisk
    try {
      fs.symlinkSync(ramdiskPath, path, 'dir');
    } catch (error) {
      if (error.code === 'EEXIST') {
        console.log(
          'Path already exists',
          path,
          fs.statSync(path, { throwIfNoEntry: false }),
        );
      } else {
        throw error;
      }
    }

    console.info(
      colors.blue(`⬡ aps:`),
      `Build being written to ${ramdiskPath} (linked at ${compiler.options.output.path})`,
    );
  },
};
