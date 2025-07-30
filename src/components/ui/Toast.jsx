/**
 * Toast notification component
 */
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, MessageSquare, X } from 'lucide-react';
import { TOAST_TYPES, DEFAULTS } from '../../config/constants';

const Toast = ({ 
  message, 
  type = TOAST_TYPES.INFO, 
  onClose, 
  duration = DEFAULTS.TOAST_DURATION,
  position = 'top-right' 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getToastStyles = () => {
    const baseStyles = 'fixed p-4 rounded-xl shadow-2xl flex items-center z-[100] transition-all duration-300 ease-in-out transform translate-x-0 opacity-100 max-w-md';
    
    const positionStyles = {
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
    };

    const typeStyles = {
      [TOAST_TYPES.SUCCESS]: 'bg-green-600 text-white',
      [TOAST_TYPES.ERROR]: 'bg-red-600 text-white',
      [TOAST_TYPES.WARNING]: 'bg-orange-600 text-white',
      [TOAST_TYPES.INFO]: 'bg-blue-600 text-white',
    };

    return `${baseStyles} ${positionStyles[position] || positionStyles['top-right']} ${typeStyles[type] || typeStyles[TOAST_TYPES.INFO]}`;
  };

  const getIcon = () => {
    const iconProps = { size: 24, className: 'mr-3 flex-shrink-0' };
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle {...iconProps} />;
      case TOAST_TYPES.ERROR:
        return <AlertCircle {...iconProps} />;
      case TOAST_TYPES.WARNING:
        return <AlertCircle {...iconProps} />;
      case TOAST_TYPES.INFO:
      default:
        return <MessageSquare {...iconProps} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
