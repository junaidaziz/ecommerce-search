import React, { useRef } from 'react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional actions to render in a footer */
  actions?: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  if (!isOpen) return null;
  return (
    <dialog
      ref={dialogRef}
      open
      className="modal"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-box max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-2">
          {title && <h2 className="font-semibold text-lg">{title}</h2>}
          <button
            type="button"
            className="btn btn-sm btn-circle"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
        {actions && <div className="mt-4">{actions}</div>}
      </div>
    </dialog>
  );
};

export default GenericModal;
