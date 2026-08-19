import { useEffect } from 'react';
import { pushModal } from '../utilities/modalStack';

// Closes a modal on Escape, and registers it in the modal stack so the Android
// hardware back button can close it too. Every modal already closes on a
// backdrop tap, but that's mouse/touch only — keyboard users had no way out
// without tabbing to the close button, and on Android back exited the app.
export function useEscapeToClose(onClose) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const unregister = pushModal(onClose);
    return () => {
      window.removeEventListener('keydown', onKey);
      unregister();
    };
  }, [onClose]);
}
