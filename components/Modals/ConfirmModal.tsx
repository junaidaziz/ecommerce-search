import React from 'react';
import GenericModal from './GenericModal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <GenericModal isOpen={isOpen} onClose={onCancel} title={title}>
    {description && <p className="mb-4">{description}</p>}
    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="btn"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        className="btn btn-error"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Deleting...' : confirmLabel}
      </button>
    </div>
  </GenericModal>
);

export default ConfirmModal;
