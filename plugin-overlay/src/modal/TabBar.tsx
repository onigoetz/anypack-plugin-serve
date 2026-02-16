import clsx from 'clsx';
import ConnectionStatus from '../ConnectionStatus';
import RuntimeIcon from '../icons/RuntimeIcon';
import ProblemBadge from '../ProblemBadge';
import type { CompilerEntry } from '../types';
import styles from './TabBar.module.css';
import type { Tab } from './types';

export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  compilers: CompilerEntry[];
  runtimeErrorCount: number;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  compilers,
  runtimeErrorCount,
}: Readonly<TabBarProps>) {
  const handleKeyDown = (
    e: KeyboardEvent,
    currentIndex: number,
    tabs: Tab[],
  ) => {
    let newIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onTabChange(tabs[newIndex].id);
    const tabElement = document.getElementById(`tab-${tabs[newIndex].id}`);
    tabElement?.focus();
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.type === 'runtime') {
      return (
        <>
          <RuntimeIcon />
          <span>{tab.label}</span>
          {runtimeErrorCount > 0 && (
            <ProblemBadge count={runtimeErrorCount} error size="small" />
          )}
        </>
      );
    }

    const compiler = compilers[tab.compilerIndex!];
    const errorCount = compiler?.compiler.errors.length || 0;
    const warningCount = compiler?.compiler.warnings.length || 0;

    return (
      <>
        <ConnectionStatus isConnected={compiler?.connected || false} />
        <span>{tab.label}</span>
        {errorCount > 0 && (
          <ProblemBadge count={errorCount} error size="small" />
        )}
        {warningCount > 0 && (
          <ProblemBadge count={warningCount} warning size="small" />
        )}
      </>
    );
  };

  /* biome-ignore-start lint/a11y/noNoninteractiveElementToInteractiveRole: not sure what to do instead */
  return (
    <nav class={styles.tabBar} role="tablist" aria-label="Error categories">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTabId === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          tabIndex={activeTabId === tab.id ? 0 : -1}
          class={clsx(styles.tab, activeTabId === tab.id && styles.tabActive)}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, index, tabs)}
          data-testid={`tab-${tab.id}`}
        >
          {getTabTitle(tab)}
        </button>
      ))}
    </nav>
  );
  /* biome-ignore-end lint/a11y/noNoninteractiveElementToInteractiveRole: ^ */
}
