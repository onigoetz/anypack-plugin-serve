import clsx from 'clsx';
import styles from './ConnectionStatus.module.css';

export default function ConnectionStatus({ isConnected }) {
  return (
    <div
      class={clsx(
        styles.status,
        isConnected ? styles.statusConnected : styles.statusDisconnected,
      )}
    ></div>
  );
}
