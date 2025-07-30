/**
 * Modal component with different sizes and animations
 */
import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { MODAL_SIZES } from '../../config/constants';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = MODAL_SIZES.MD,
  closeOnOverlayClick = true,
  showCloseButton = true 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    const sizeClasses = {
      [MODAL_SIZES.SM]: 'max-w-sm',
      [MODAL_SIZES.MD]: 'max-w-md',
      [MODAL_SIZES.LG]: 'max-w-lg',
      [MODAL_SIZES.XL]: 'max-w-xl',
      [MODAL_SIZES.FULL]: 'max-w-full mx-4 sm:mx-6 lg:mx-8',
    };
    return sizeClasses[size] || sizeClasses[MODAL_SIZES.MD];
  };

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity duration-300 ease-in-out"
        onClick={handleOverlayClick}
      >
        {/* Modal Content */}
        <div 
          className={`bg-slate-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full ${getSizeClass()} p-6 sm:p-8 max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out animate-modalShow`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Fechar modal"
              >
                <XCircle size={28} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-grow custom-scrollbar pr-2">
            {children}
          </div>
        </div>
      </div>

      {/* Modal animation styles */}
      <style jsx>{`
        @keyframes modalShow {
          0% { 
            transform: scale(0.95); 
            opacity: 0; 
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }
        .animate-modalShow { 
          animation: modalShow 0.3s forwards; 
        }
      `}</style>
    </>
  );
};

export default Modal;
