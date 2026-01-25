import clsx from 'clsx';
import styles from './ProblemBadge.module.css';

export default function ProblemBadge({ count, warning, error, size }) {
  return (
    <div
      class={clsx(
        styles.container,
        warning && styles.warning,
        error && styles.error,
        size === 'small' && styles.small,
      )}
    >
      {count}
    </div>
  );
}
