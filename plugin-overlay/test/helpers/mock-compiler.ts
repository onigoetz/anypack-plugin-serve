import type { Compiler, CompilerEntry } from '../../src/types';

interface MockCompiler extends Compiler {
  setState(newState: CompilerEntry): void;
  triggerChange(): void;
}

export function createMockCompiler(initialState?: CompilerEntry): MockCompiler {
  let state: CompilerEntry = initialState || {
    connected: false,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  };

  let changeCallback: (() => void) | null = null;

  return {
    get state() {
      return state;
    },
    onChange(callback: () => void) {
      changeCallback = callback;
    },
    setState(newState: CompilerEntry) {
      state = newState;
    },
    triggerChange() {
      if (changeCallback) changeCallback();
    },
  };
}
