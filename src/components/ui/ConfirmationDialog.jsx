/**
 * Confirmation dialog component
 */
import React from 'react';
import Modal from './Modal';
import { CSS_CLASSES } from '../../config/constants';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Ação', 
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger', // 'danger', 'primary', 'warning'
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    const baseClass = 'px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (confirmVariant) {
      case 'primary':
        return `${baseClass} bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-400`;
      case 'warning':
        return `${baseClass} bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400`;
      case 'danger':
      default:
        return `${baseClass} bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400`;
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in confirmation action:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="md"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
          {message}
        </p>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={getConfirmButtonClass()}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
