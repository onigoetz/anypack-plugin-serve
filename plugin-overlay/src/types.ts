/**
 * Represents the state of a single compiler
 */
export interface CompilerState {
  done: boolean;
  progress: number;
  errors: unknown[];
  warnings: unknown[];
}

/**
 * Represents the full state of an overlay compiler entry
 */
export interface CompilerEntry {
  connected: boolean;
  compiler: CompilerState;
}

/**
 * Interface for objects that can be registered as compilers
 * with the OverlayManager
 */
export interface Compiler {
  state: CompilerEntry;
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
