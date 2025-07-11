import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
  const modalBoxRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      // Focus on the modal box
      if (modalBoxRef.current) {
        modalBoxRef.current.focus();
      }
    } else {
      // Restore scroll position and scroll
      document.body.style.overflow = '';
      if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal Box */}
      <div
        ref={modalBoxRef}
        className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] flex flex-col outline-none"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header: perfectly aligned title and close button */}
        <div className="flex flex-row items-center justify-between min-h-[2.5rem] mb-4 gap-2">
          {title && <h2 className="font-semibold text-lg text-white flex-1 truncate">{title}</h2>}
          <button
            type="button"
            className="btn btn-sm btn-circle px-1"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
        {actions && <div className="mt-4 flex flex-col sm:flex-row gap-3">{actions}</div>}
      </div>
    </div>,
    typeof window !== 'undefined' && document.body ? document.body : document.createElement('div')
  );
};

export default GenericModal;
