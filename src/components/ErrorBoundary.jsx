/**
 * Error Boundary component to catch React errors
 */
import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { handleReactError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    handleReactError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Algo deu errado
              </h1>
              <p className="text-slate-300 text-sm">
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
              >
                <RefreshCw size={18} className="mr-2" />
                Recarregar Página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
              >
                <Home size={18} className="mr-2" />
                Ir para Início
              </button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <div className="mt-2 p-3 bg-slate-900 rounded text-xs text-red-400 overflow-auto max-h-40">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="mb-2">{this.state.error.toString()}</div>
                  <div className="font-semibold mb-1">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook to handle errors in functional components
export const useErrorHandler = () => {
  const handleError = (error, operation = 'operação') => {
    logger.error(`Error in ${operation}`, {
      error: error.message,
      stack: error.stack,
    });
    
    // In a real app, you might want to show a toast or modal
    console.error(`Error in ${operation}:`, error);
  };

  return { handleError };
};

export default ErrorBoundary;
