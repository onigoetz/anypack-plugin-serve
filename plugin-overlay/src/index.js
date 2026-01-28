import { render } from 'preact';

import Root from './Root.js';

export class OverlayManager {
  compilers = [];
  listeners = [];

  addCompiler(compiler) {
    this.compilers.push(compiler);
    compiler.onChange(() => this.render());
  }

  addListener(fn) {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  }

  render() {
    for (const listener of this.listeners) {
      listener(this.compilers);
    }
  }
}

export function init() {
  const manager = new OverlayManager();

  const container = document.createElement('div');
  container.setAttribute('data-testid', 'overlay-container');
  document.body.appendChild(container);
  render(<Root manager={manager} />, container);

  return manager;
}
