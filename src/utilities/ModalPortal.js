import { createPortal } from 'react-dom';

// NativeApp's <main> is `relative z-10`, which makes it a stacking context: a
// modal rendered inside a screen can't paint above the z-20 top bar and tab
// bar no matter how high its own z-index goes. The bottom of its scroll area
// ends up underneath the tab bar, so the last stretch of content can't be
// scrolled into view at all.
//
// Portalling to <body> puts modals in the root stacking context, where z-50
// means what it looks like it means.
export default function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
