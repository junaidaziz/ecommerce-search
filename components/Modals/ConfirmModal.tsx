import React from 'react';
import GenericModal from './GenericModal';
import Button from '../UI/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  email?: string;
  name?: string;
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
  email,
  name,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <GenericModal isOpen={isOpen} onClose={onCancel} title={title}>
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-base text-gray-200">
            Are you sure you want to delete the following user?
          </p>
          {email && (
            <p className="text-base font-medium text-red-400 break-words">
              {name ? `${name} ` : ''}
              {email}
            </p>
          )}
          <p className="text-sm text-gray-400">
            This action <strong>cannot be undone.</strong>
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          size="md"
          rounded={false}
          className="w-full sm:w-auto min-w-[120px]"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          rounded={false}
          className="w-full sm:w-auto min-w-[120px]"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </div>
  </GenericModal>
);

export default ConfirmModal;
