import { render } from 'preact';

import Root from './Root.js';

class OverlayManager {
  compilers = [];
  listeners = [];

  constructor() {
    this.init();
  }

  init() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Root manager={this} />, container);
  }

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
  return new OverlayManager();
}
