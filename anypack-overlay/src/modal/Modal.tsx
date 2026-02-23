import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import CloseIcon from '../icons/CloseIcon';
import type { CompilerEntry, RuntimeError } from '../types';
import styles from './Modal.module.css';
import TabBar from './TabBar';
import TabContent from './TabContent';
import type { Tab } from './types';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  runtimeErrors: RuntimeError[];
  compilers: CompilerEntry[];
}

export default function Modal({
  isOpen,
  onClose,
  runtimeErrors,
  compilers,
}: ModalProps) {
  const [activeTabId, setActiveTabId] = useState('runtime');
  const modalRef = useRef<HTMLDialogElement>(null);

  const tabs: Tab[] = [
    { id: 'runtime', type: 'runtime', label: 'Runtime Errors', runtimeErrors },
    ...compilers.map((compiler, index) => ({
      id: `compiler-${index}`,
      type: 'compiler' as const,
      label: compiler.name || `Compiler ${index + 1}`,
      compiler,
    })),
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  /* biome-ignore-start lint/a11y/useKeyWithClickEvents : handled globally */
  /* biome-ignore-start lint/a11y/noStaticElementInteractions : trying like this */
  return createPortal(
    <div
      class={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="modal-backdrop"
    >
      <dialog
        ref={modalRef}
        class={styles.modal}
        aria-modal="true"
        open
        data-testid="modal"
      >
        <header class={styles.header}>
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            runtimeErrorCount={runtimeErrors.length}
          />
          <button
            type="button"
            class={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close"
          >
            <CloseIcon />
          </button>
        </header>

        <TabContent activeTab={activeTab} />
      </dialog>
    </div>,
    document.body,
  );
  /* biome-ignore-end lint/a11y/useKeyWithClickEvents : ^ */
  /* biome-ignore-end lint/a11y/noStaticElementInteractions : ^ */
}
