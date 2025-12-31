# rspack-nano

A teensy, squeaky 🐤 clean Rspack CLI

`rspack-nano` operates on the premise that all options for configuring a Rspack build are set via a [config file](https://rspack.rs/config/).

## Install

Using npm:

```console
npm install rspack-nano --save-dev
```

<a href="https://www.patreon.com/shellscape">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

## Requirements

`rspack-nano` is an evergreen module. 🌲 This module requires an [Active LTS](https://github.com/nodejs/Release) Node version (v20.0.0+).

## Benefits

- Holy bananas 🍌 it's itsy bitsy
- Doesn't hit you over the head with an avalanche of flags and options
- Allows any number of user-defined flags
- It does one thing: tells Rspack to start a build
- ~90% smaller than webpack-cli and webpack-command

## Usage

```console
$ npx rp --help

  Usage
    $ rp [...options]

  Options
    --config          A path to a Rspack config file
    --config.{name}   A path to a Rspack config file, and the config name to run
    --json            Emit bundle information as JSON
    --help            Displays this message
    --silent          Instruct the CLI to produce no console output
    --version         Displays rspack-nano and Rspack versions

  Examples
    $ rp
    $ rp --help
    $ rp --config rspack.config.js
    $ rp --config.serve rspack.config.js
```

## Custom Flags

With `webpack-cli` users are limited as to the flags they can use on with the `$ webpack` binary, and are instructed to use the `--env` flag for custom data. Well that's just 🍌🍌. With `rspack-nano` users can specify an unlimited number of custom flags, _without restriction_.

Say you have a bundle which can be built to use different asset locations from cloud data sources, like Amazon S3 or Google Cloud Storage. And in this scenario you prefer to specify that location using a command-line flag. If you were using `webpack-cli`, you'd have to use the `--env.source` flag (or you'd get a big 'ol error) and use a function for your `webpack.config.js` export. Using `rspack-nano`:

```console
$ rp --config rspack.config.js --source s3
```

```js
// rspack.config.js
const argv = require('rspack-nano/argv');

const { source } = argv;

module.exports = {
  ...
}
```

✨ Magic. The `rspack-nano/argv` export provides quick and easy access to parsed command-line arguments, allowing the user to define the CLI experience as they want to.

## Build Stats

This project attempts not to make assumptions about how a build should behave, and that includes Rspack [`stats`](https://rspack.rs/config/stats#stats). By default, `rspack-nano` will apply two `stats` options: `colors` (based on [`supports-color`](https://github.com/chalk/supports-color) and `exclude: ['node_modules']`). These can be quickly overridden by including these key/values in your stats configuration.

## Meta

[LICENSE (Mozilla Public License)](./LICENSE)
