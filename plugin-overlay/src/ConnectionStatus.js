import clsx from 'clsx';
import styles from './ConnectionStatus.module.css';

export default function ConnectionStatus({ isConnected }) {
  return (
    <output
      data-testid="connection-status"
      data-connected={isConnected}
      aria-label={isConnected ? 'Connected' : 'Disconnected'}
      class={clsx(
        styles.status,
        isConnected ? styles.statusConnected : styles.statusDisconnected,
      )}
    ></output>
  );
}
