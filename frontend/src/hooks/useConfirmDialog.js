import { useState, useCallback } from 'react';

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });

  const showConfirm = useCallback(({ title, message, onConfirm, confirmText, cancelText }) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          resolve(true);
          if (onConfirm) onConfirm();
        },
        onCancel: () => {
          resolve(false);
        },
        confirmText: confirmText || 'Confirmar',
        cancelText: cancelText || 'Cancelar',
      });
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => {
      if (prev.onCancel) {
        prev.onCancel();
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, [dialog]);

  return {
    dialog,
    showConfirm,
    closeDialog,
    handleConfirm,
  };
};


