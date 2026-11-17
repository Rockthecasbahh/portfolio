import { useEffect, useRef } from 'react';

function isOutsideRect(e: PointerEvent, dialog: HTMLDialogElement): boolean {
  const r = dialog.getBoundingClientRect();
  return (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  );
}

/**
 * Syncs a React nullable selection state with a native <dialog> via showModal(),
 * adding pointer light-dismiss fallback when `closedby` is unsupported.
 */
export function useNativeModalDialog(isOpen: boolean, onDismiss: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      if (dialog.open) pressedOutside = isOutsideRect(e, dialog);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (dialog.open && pressedOutside && isOutsideRect(e, dialog)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, [onDismiss]);

  return dialogRef;
}
