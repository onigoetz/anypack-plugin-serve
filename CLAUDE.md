# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`anypack-plugin-serve` is a fork of `webpack-plugin-serve` that adds Rspack compatibility and reduces bundle size. It implements a dev server as a webpack/rspack plugin (no separate process needed), communicating with browser clients via WebSocket.

## Commands

### Root (all workspaces)
```bash
yarn test         # Run tests in all workspaces
yarn build        # Build all workspaces (required before testing plugin)
yarn lint         # Lint and auto-fix all workspaces
yarn ci:lint      # Lint without auto-fix (CI mode)
```

### Per-workspace
```bash
yarn workspace anypack-plugin-serve test
yarn workspace anypack-overlay test
yarn workspace anypack-overlay build    # Must run before plugin tests
```

### Running a single test file
From within a workspace directory:
```bash
cd plugin && npx rstest test/plugin.test.js
cd anypack-overlay && npx rstest test/component/Modal.test.tsx
```

### Overlay build variants
```bash
cd anypack-overlay && yarn build       # Production build (NODE_ENV=production)
cd anypack-overlay && yarn build:dev   # Development build
cd anypack-overlay && yarn typecheck   # TypeScript type-check only
```

## Architecture

### Monorepo structure (Yarn 4 workspaces)
- **`plugin/`** — Main webpack plugin (`anypack-plugin-serve`, CommonJS, no build step)
- **`anypack-overlay/`** — Browser overlay UI (`anypack-overlay`, TypeScript + Preact, **requires build**)
- **`rspack-nano/`** — Tiny Rspack CLI utility (`rp` binary, private)
- **`recipes/`** — Example configurations (not published)

### plugin/ — Server-side plugin

`AnypackPluginServe` (in `lib/index.js`) extends `EventEmitter` and hooks into the webpack/rspack compiler lifecycle:
- `watchRun` → starts a Polka HTTP server on first run
- `beforeCompile`/`done`/`invalid`/`watchClose` → emits events to WebSocket clients

The server (`lib/server.js`) uses [Polka](https://github.com/lukeed/polka) with built-in middleware (`lib/middleware.js`):
- `compress`, `headers`, `historyFallback`, `static` (via sirv), `websocket`, `proxy` (http-proxy-middleware), `four0four`
- Middleware are wrapped with `onetime` so user-controlled ordering via the `middleware` option can't accidentally double-apply them

WebSocket server (`lib/ws.js`) upgrades HTTP connections at the `/wps` route (`lib/routes.js`), sends JSON messages: `connected`, `build`, `done`, `problems`, `progress`, `replace`, `reload`, `invalid`.

Plugin options are passed to the browser via webpack's `DefinePlugin` under the intentionally-obfuscated global `ʎɐɹɔosǝʌɹǝs`.

`lib/plugins/` contains HMR (`hmr.js`) and ramdisk (`ramdisk.js`) compiler sub-plugins applied conditionally.

### plugin/client.js — Browser entry point

Users add `anypack-plugin-serve/client` to their webpack `entry` array. This IIFE:
1. Reads the `ʎɐɹɔosǝʌɹǝs` global for options
2. Calls `init()` from `anypack-overlay` to create the overlay singleton
3. Creates a `Compiler` instance (`lib/client/Compiler.js`) that manages the WebSocket connection
4. Registers the compiler with `OverlayManager`

`ClientSocket` (`lib/client/ClientSocket.js`) wraps the browser `WebSocket` with exponential-backoff reconnection (up to 10 attempts). `Compiler` handles incoming WebSocket messages and triggers HMR (`lib/client/hmr.js`) or live reload.

### anypack-overlay/ — Browser overlay UI

Built with [rslib](https://github.com/web-infra-dev/rslib) into a single ESM file (`dist/index.js`) with CSS inlined (no separate stylesheet).

- **`src/index.tsx`** — Exports `init(): OverlayManager`, creates a DOM container and mounts the Preact app
- **`src/OverlayManager.ts`** — State manager: tracks compilers and runtime errors, notifies listeners on change; captures `window.onerror` and `unhandledrejection`
- **`src/Root.tsx`** — Root Preact component: subscribes to `OverlayManager`, renders `MiniStatus` (always visible) and `Modal` (shown on errors)
- **`src/modal/`** — Modal dialog with tab navigation for compilation errors/warnings and runtime errors
- CSS Modules used throughout; Preact is aliased as `react`/`react-dom` in the test config

### Data flow summary
```
webpack hooks → AnypackPluginServe (EventEmitter) → WebSocket at /wps
                                                         ↓
browser: ClientSocket → Compiler.handleMessage() → OverlayManager.render() → Preact UI
```

## Tooling

- **Test runner**: `rstest` (`@rstest/core`) — vitest-compatible API
  - `plugin/` tests: CommonJS, some integration tests use puppeteer
  - `anypack-overlay/` tests: TypeScript/TSX with happy-dom environment, `@testing-library/preact`
- **Linter/formatter**: Biome — single quotes, 2-space indent
- **Node requirement**: >= 20.0.0 (`.nvmrc` says `14`, but `package.json` engines say `>= 20.0.0`)

## Important notes

- `anypack-overlay` **must be built** (`yarn build`) before `plugin` tests run, since `plugin` depends on `anypack-overlay: workspace:*` resolved from `dist/`
- The plugin enforces a singleton: only one `AnypackPluginServe` instance is active per process (use undocumented `allowMany: true` option in tests to bypass)
- Multi-compiler support: each compiler gets a unique `wpsId` (nanoid); the `replace` WebSocket action is only applied by the matching compiler instance in the browser
