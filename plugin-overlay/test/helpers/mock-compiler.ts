import type {
  Compiler,
  CompilerEntry,
  RuntimeError,
  WarningOrError,
} from '../../src/types';

export function createMockError(message: string): WarningOrError {
  return {
    moduleIdentifier: 'test-module',
    moduleName: './test.js',
    loc: '1:0',
    code: '',
    message,
    moduleId: '0',
    moduleTrace: [],
    details: '',
    stack: '',
  };
}

export function createMockRuntimeError(
  message: string,
  overrides?: Partial<RuntimeError>,
): RuntimeError {
  return {
    message,
    filename: 'test.js',
    lineno: 1,
    colno: 1,
    stack: `Error:·${message}\n····at·test.js:1:1`,
    timestamp: Date.now(),
    ...overrides,
  };
}

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
