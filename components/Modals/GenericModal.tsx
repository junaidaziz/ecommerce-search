import React, { useRef, useEffect } from 'react';

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
  const modalBoxRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
      
      // Focus on the modal box instead of the dialog to prevent scroll jumping
      if (modalBoxRef.current) {
        modalBoxRef.current.focus();
      }
    } else {
      // Restore scroll position when modal closes
      if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
  }, [isOpen]);

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
      <div 
        ref={modalBoxRef}
        className="modal-box max-h-[90vh] flex flex-col"
        tabIndex={-1}
      >
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
