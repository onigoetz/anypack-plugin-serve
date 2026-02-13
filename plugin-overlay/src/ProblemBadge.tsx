import clsx from 'clsx';
import styles from './ProblemBadge.module.css';

interface ProblemBadgeProps {
  count: number;
  warning?: boolean;
  error?: boolean;
  size?: 'small' | 'normal';
}

export default function ProblemBadge({
  count,
  warning,
  error,
  size,
}: ProblemBadgeProps) {
  const type = error ? 'error' : warning ? 'warning' : 'problem';
  const pluralized = count === 1 ? type : `${type}s`;
  const ariaLabel = `${count} ${pluralized}`;

  return (
    <output
      data-testid="problem-badge"
      data-type={type}
      aria-label={ariaLabel}
      aria-live="polite"
      class={clsx(
        styles.container,
        warning && styles.warning,
        error && styles.error,
        size === 'small' && styles.small,
      )}
    >
      {count}
    </output>
  );
}
