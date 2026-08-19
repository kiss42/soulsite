// A registry of every modal that's currently open, innermost last.
//
// The Android hardware back button has to close the topmost modal rather than
// background the whole app, and modals live all over the tree — some in
// UIContext, most in local component state. Rather than lift all of that state
// up, each modal registers its own onClose here while it's mounted.
const stack = [];

export function pushModal(onClose) {
  const entry = { onClose };
  stack.push(entry);
  return () => {
    const i = stack.indexOf(entry);
    if (i !== -1) stack.splice(i, 1);
  };
}

// Closes the most recently opened modal. Returns false when none are open, so
// the caller can fall back to its default behaviour.
export function closeTopModal() {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.onClose();
  return true;
}

export const anyModalOpen = () => stack.length > 0;
