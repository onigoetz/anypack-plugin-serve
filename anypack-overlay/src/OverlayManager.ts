import type {
  Compiler,
  OverlayListener,
  RuntimeError,
  Unsubscribe,
} from './types';

export default class OverlayManager {
  compilers: Compiler[] = [];
  errors: RuntimeError[] = [];
  listeners: OverlayListener[] = [];

  constructor() {
    const handleErrorEvent = (event: ErrorEvent) => {
      this.addError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      this.addError({
        message:
          error?.message || String(error) || 'Unhandled Promise Rejection',
        stack: error?.stack,
        timestamp: Date.now(),
      });
    };

    globalThis.addEventListener('error', handleErrorEvent);
    globalThis.addEventListener('unhandledrejection', handleRejection);
  }

  addError(error: RuntimeError) {
    this.errors.push(error);
    this.render();
  }

  addCompiler(compiler: Compiler): void {
    this.compilers.push(compiler);
    compiler.onChange(() => this.render());
    this.render();
  }

  addListener(fn: OverlayListener): Unsubscribe {
    this.listeners.push(fn);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  }

  render(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.compilers);
      } catch (e) {
        console.error('Failed to call listener', e);
      }
    }
  }
}
