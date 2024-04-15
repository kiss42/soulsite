import React from 'react';
import styles from './styles/ButtonWithRing.css';

const ButtonWithRing = ({ children, onClick }) => {
  return (
    <div className={styles.wrap}>
      <button className={styles.button} onClick={onClick}>
        {children}
      </button>
    </div>
  );
};

export default ButtonWithRing;
