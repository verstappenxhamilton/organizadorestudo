/**
 * Application entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Simple startup log
console.log('Organizador de Estudos - Starting application...');

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default browser behavior
  event.preventDefault();
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.message, event.filename, event.lineno);
});

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
