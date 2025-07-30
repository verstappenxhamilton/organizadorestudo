/**
 * Toast notification hook
 */
import { useState, useCallback } from 'react';
import { TOAST_TYPES } from '../config/constants';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = TOAST_TYPES.INFO, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      ...options,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration (if not persistent)
    if (!options.persistent) {
      const duration = options.duration || 3000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, TOAST_TYPES.SUCCESS, options);
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    return showToast(message, TOAST_TYPES.ERROR, options);
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, TOAST_TYPES.WARNING, options);
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, TOAST_TYPES.INFO, options);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useToast;
