import { useRef } from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  // Preserve content during close animation - only update when dialog is open
  const lastTitle = useRef(title);
  const lastMessage = useRef(message);
  const wasOpen = useRef(false);

  // Only capture values when dialog opens or while it's open with valid content
  if (isOpen && !message.includes('undefined')) {
    lastTitle.current = title;
    lastMessage.current = message;
    wasOpen.current = true;
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Always use the preserved values to prevent flash
  const displayTitle = lastTitle.current || title;
  const displayMessage = lastMessage.current || message;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={displayTitle}>
      <p className="text-sm text-[#a8a29e]">{displayMessage}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleClose}
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
