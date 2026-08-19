import { useEffect } from 'react';

// Closes a modal on Escape. Every modal already closes on a backdrop tap, but
// that's mouse/touch only — keyboard users had no way out without tabbing to
// the close button.
export function useEscapeToClose(onClose) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}
