import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { closeTopModal } from '../utilities/modalStack';

// Android's hardware back button has no default meaning in a Capacitor WebView:
// without a listener it backgrounds the whole app. That made every modal — and
// the privacy policy page — a dead end you could only leave by force-quitting.
//
// Precedence: close the topmost modal, else walk back through in-app history,
// else let the app background (the OS default for a back press at the root).
export function useAndroidBackButton() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    let remove = () => {};
    let cancelled = false;

    // Imported lazily so the web bundle never pulls the plugin in.
    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;
      App.addListener('backButton', ({ canGoBack }) => {
        if (closeTopModal()) return;
        if (canGoBack) window.history.back();
        else App.minimizeApp();
      }).then(handle => {
        if (cancelled) handle.remove();
        else remove = () => handle.remove();
      });
    });

    return () => { cancelled = true; remove(); };
  }, []);
}
