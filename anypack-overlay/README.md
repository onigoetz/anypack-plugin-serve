# Dev Server Overlay

![Overlay example](https://raw.githubusercontent.com/onigoetz/anypack-plugin-serve/master/assets/overlay.png)

An overlay that supports multiple Dev Servers

## Features

- Display Connection status of each server
- Display Compilation errors / warnings
- Display runtime errors

## Usage

Comes right out the box with `anypack-plugin-serve`.

The API allows to make it work with any other dev server.

## API

Initializing overlay.
It's done conditionally because we only need one instance initialized.

```javascript
if (!window.anypackOverlay) {
  const { init } = require("anypack-overlay");

  window.anypackOverlay = init();
}
```

You can register many compilers

```javascript
window.anypackOverlay.addCompiler(compiler);
```

(Following the interface defined in `src/types.ts`)
