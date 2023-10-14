import { useState } from 'react';

const Modal = ({ onClose, children, title }) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Overlay background
    >
      <div className="scale-100 transform rounded-lg bg-white p-6 shadow-2xl transition-transform duration-300 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white">
            {' '}
            {title}{' '}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={closeModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.348 14.849a1 1 0 010 1.415a1 1 0 01-1.415 0l-2.83-2.829l-2.828 2.83a1 1 0 01-1.415 0a1 1 0 010-1.415l2.828-2.829l-2.828-2.828a1 1 0 010-1.415a1 1 0 011.415 0l2.828 2.828l2.83-2.828a1 1 0 011.415 0a1 1 0 010 1.415l-2.83 2.828l2.83 2.829z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
