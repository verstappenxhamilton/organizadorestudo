import React from 'react';

export const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal p-6 max-w-sm">
        <h3 className="text-lg font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-300 mb-6 text-sm">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
