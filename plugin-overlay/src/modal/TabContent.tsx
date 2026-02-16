import clsx from 'clsx';
import { useState } from 'preact/hooks';
import type { CompilerEntry, RuntimeError, WarningOrError } from '../types';
import Pagination from './Pagination';
import styles from './TabContent.module.css';
import type { Tab } from './types';

type Problem =
  | {
      problem: WarningOrError;
      type: 'error';
    }
  | {
      problem: WarningOrError;
      type: 'warning';
    };

type ProblemOrRuntime =
  | Problem
  | {
      problem: RuntimeError;
      type: 'runtime';
    };

export function RuntimeErrorDisplay({
  error,
}: Readonly<{ error: RuntimeError }>) {
  return (
    <>
      <pre class={styles.message} data-testid="error-message">
        <code>{error.message}</code>
      </pre>

      {error.filename && (
        <div class={styles.location} data-testid="error-location">
          {error.filename}
          {error.lineno && `:${error.lineno}`}
          {error.colno && `:${error.colno}`}
        </div>
      )}

      {error.stack && (
        <pre class={styles.stack} data-testid="error-stack">
          <code>{error.stack}</code>
        </pre>
      )}
    </>
  );
}

export function ProblemDisplay({
  error,
}: Readonly<{ error: WarningOrError; type: 'error' | 'warning' }>) {
  return (
    <>
      <pre class={styles.message} data-testid="error-message">
        <code>{error.message}</code>
      </pre>

      <div class={styles.location} data-testid="error-location">
        {error.moduleName}
        {error.loc && ` (${error.loc})`}
        {error.moduleTrace && error.moduleTrace.length > 0 && (
          <ul class={styles.traceList} data-testid="module-trace">
            {error.moduleTrace.map((trace, i) => (
              <li key={i} class={styles.traceItem}>
                {trace.moduleName}
                {trace.dependencies.length > 0 && (
                  <span class={styles.traceLoc}>
                    {' '}
                    ({trace.dependencies[0].loc})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error.details && (
        <pre class={styles.details} data-testid="error-details">
          <code>{error.details}</code>
        </pre>
      )}

      {error.stack && (
        <pre class={styles.stack} data-testid="error-stack">
          <code>{error.stack}</code>
        </pre>
      )}
    </>
  );
}

export interface TabContentProps {
  activeTab: Tab;
  runtimeErrors: RuntimeError[];
  compilers: CompilerEntry[];
}

export default function TabContent({
  activeTab,
  runtimeErrors,
  compilers,
}: Readonly<TabContentProps>) {
  const [paginationState, setPaginationState] = useState({
    currentIndex: 0,
    tabId: activeTab.id,
  });

  // We use this technique to set the index back to zero on tab change which triggers a fresh render
  if (activeTab.id !== paginationState.tabId) {
    setPaginationState({ currentIndex: 0, tabId: activeTab.id });
    return;
  }

  const currentIndex = paginationState.currentIndex;
  const setCurrentIndex = (index: number) =>
    setPaginationState((prev) => ({ ...prev, currentIndex: index }));

  let problems: ProblemOrRuntime[] = [];

  if (activeTab.type === 'runtime') {
    problems = runtimeErrors.map((problem) => ({ type: 'runtime', problem }));
  } else {
    const compiler = compilers[activeTab.compilerIndex!];

    problems = [
      ...(compiler?.compiler.errors || []).map((problem) => ({
        type: 'error',
        problem,
      })),
      ...(compiler?.compiler.warnings || []).map((problem) => ({
        type: 'warning',
        problem,
      })),
    ] as Problem[];
  }

  const currentProblem = problems[currentIndex];

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${activeTab.id}`}
      aria-labelledby={`tab-${activeTab.id}`}
      class={styles.content}
      data-testid="tab-content"
    >
      {problems.length === 0 ? (
        <div class={styles.empty} data-testid="no-errors">
          {activeTab.type === 'runtime' ? (
            <>No runtime errors</>
          ) : (
            <>No compilation problems</>
          )}
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h3
              class={clsx(
                styles.title,
                currentProblem.type === 'warning' && styles.warningTitle,
              )}
            >
              {currentProblem.type === 'runtime' && 'Unhandled Runtime Error'}
              {currentProblem.type === 'error' && 'Compilation Error'}
              {currentProblem.type === 'warning' && 'Compilation Warning'}
            </h3>
            <Pagination
              current={currentIndex + 1}
              total={problems.length}
              onPrevious={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              onNext={() =>
                setCurrentIndex(Math.min(problems.length - 1, currentIndex + 1))
              }
            />
          </div>

          <article class={styles.problem} data-testid="error-display">
            {currentProblem.type === 'runtime' ? (
              <RuntimeErrorDisplay error={currentProblem.problem} />
            ) : (
              <ProblemDisplay
                error={currentProblem.problem}
                type={currentProblem.type}
              />
            )}
          </article>
        </>
      )}
    </div>
  );
}
