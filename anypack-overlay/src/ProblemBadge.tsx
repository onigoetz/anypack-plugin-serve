import clsx from 'clsx';
import styles from './ProblemBadge.module.css';

interface ProblemBadgeProps {
  count: number;
  type: 'warning' | 'error';
  size?: 'small' | 'normal';
}

export default function ProblemBadge({
  count,
  type,
  size,
}: Readonly<ProblemBadgeProps>) {
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
        type === 'warning' && styles.warning,
        type === 'error' && styles.error,
        size === 'small' && styles.small,
      )}
    >
      {count}
    </output>
  );
}
