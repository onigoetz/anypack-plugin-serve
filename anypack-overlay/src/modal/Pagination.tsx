import styles from './Pagination.module.css';

export interface PaginationProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({
  current,
  total,
  onPrevious,
  onNext,
}: Readonly<PaginationProps>) {
  return (
    <nav class={styles.pagination} aria-label="Error navigation">
      <button
        type="button"
        class={styles.button}
        onClick={onPrevious}
        disabled={current <= 1}
        aria-label="Previous error"
        data-testid="pagination-prev"
      >
        &larr;
      </button>
      <span class={styles.indicator} data-testid="pagination-indicator">
        {current} / {total}
      </span>
      <button
        type="button"
        class={styles.button}
        onClick={onNext}
        disabled={current >= total}
        aria-label="Next error"
        data-testid="pagination-next"
      >
        &rarr;
      </button>
    </nav>
  );
}
