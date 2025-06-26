import React, { useRef } from 'react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
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
      <div className="modal-box">
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
        {children}
      </div>
    </dialog>
  );
};

export default GenericModal;
