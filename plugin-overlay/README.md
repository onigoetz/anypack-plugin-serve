# anypack-plugin-serve Overlay

An overlay that supports multiple Dev Servers

## Features

- Show Connection status of each server
- Show Compilation errors / warnings

## API

Initializing overlay.
It's done conditionally because we only need one instance initialized.

```javascript
if (!window.anypackPluginServe) {
  const { init } = require("anypack-plugin-serve-overlay");

  window.anypackPluginServe = init();
}
```

We can register many compilers

```javascript
window.anypackPluginServe.addCompiler(compiler);
```

```typescript

interface CompilerState {
    connected: boolean;
    compiler: {
        done: boolean;
        progress: number;
        errors: [];
        warnings: [];
    }
}

interface Compiler {
    state: CompilerState

    onChange(listener: (state: CompilerState): void): void;
}
```
