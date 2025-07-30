/**
 * Loading spinner component
 */
import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'sky', 
  text = null,
  className = '',
  fullScreen = false 
}) => {
  const getSizeClass = () => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };
    return sizes[size] || sizes.md;
  };

  const getColorClass = () => {
    const colors = {
      sky: 'border-sky-500',
      blue: 'border-blue-500',
      green: 'border-green-500',
      red: 'border-red-500',
      orange: 'border-orange-500',
      purple: 'border-purple-500',
      white: 'border-white',
      gray: 'border-gray-500',
    };
    return colors[color] || colors.sky;
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-transparent ${getSizeClass()} ${getColorClass()}`}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor',
        }}
      />
      {text && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-2xl">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Inline loading spinner for buttons
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-transparent border-t-current border-r-current ${
      size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    } ${className}`}
  />
);

// Loading overlay for containers
export const LoadingOverlay = ({ isLoading, children, text = 'Carregando...' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
