import type { Compiler, OverlayListener, Unsubscribe } from './types';

export default class OverlayManager {
  compilers: Compiler[] = [];
  listeners: OverlayListener[] = [];

  addCompiler(compiler: Compiler): void {
    this.compilers.push(compiler);
    compiler.onChange(() => this.render());
  }

  addListener(fn: OverlayListener): Unsubscribe {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  }

  render(): void {
    for (const listener of this.listeners) {
      listener(this.compilers);
    }
  }
}
