import React from 'react';
import { useEscapeToClose } from '../hooks/useEscapeToClose';
import ModalPortal from './ModalPortal';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEscapeToClose(isOpen ? onClose : null);
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 p-4"
      onClick={onClose} // Allow clicking the background to close the modal
    >
      {/* A bounded flex column: the title and close button stay pinned while
          only the content scrolls. Letting the whole panel scroll instead
          carries the close button off the top as soon as the content is taller
          than the screen. */}
      <div
        className="modal-surface max-w-lg w-full max-h-[calc(100dvh-2rem)] relative text-white flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal if clicking inside it
      >
        <div className="flex justify-between items-center gap-4 mb-4 shrink-0">
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-300 hover:text-red-300 transition duration-300 ease-in-out shrink-0"
            aria-label="Close modal"
          >
            ✖️
          </button>
        </div>
        {/* Modal content — the negative margin keeps the scrollbar off the text */}
        <div className="modal-content flex-1 min-h-0 overflow-y-auto -mr-2 pr-2">
          {children}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default Modal;
