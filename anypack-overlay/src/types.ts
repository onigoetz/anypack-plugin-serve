interface Dependency {
  loc: string;
}
interface ModuleTrace {
  originIdentifier: string;
  originName: string;
  moduleIdentifier: string;
  moduleName: string;
  dependencies: Dependency[];
  originId: number;
  moduleId: number;
}

export interface WarningOrError {
  message: string;
  code: string;
  moduleIdentifier: string;
  moduleName: string;

  loc?: string;

  moduleId?: string;
  moduleTrace?: ModuleTrace[];
  details?: string;
  stack?: string;
}

/**
 * Represents a captured runtime error from window error events
 */
export interface RuntimeError {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: number;
}

/**
 * Represents the state of a single compiler
 */
export interface CompilerState {
  done: boolean;
  progress: number;
  errors: WarningOrError[];
  warnings: WarningOrError[];
}

/**
 * Represents the full state of an overlay compiler entry
 */
export interface CompilerEntry {
  name?: string;
  connected: boolean;
  compiler: CompilerState;
}

/**
 * Interface for objects that can be registered as compilers
 * with the OverlayManager
 */
export interface Compiler {
  getState(): CompilerEntry;
  onChange(callback: () => void): void;
}

/**
 * Listener function type for overlay state changes
 */
export type OverlayListener = (compilers: Compiler[]) => void;

/**
 * Unsubscribe function returned when adding listeners
 */
export type Unsubscribe = () => void;
