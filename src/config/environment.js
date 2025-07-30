/**
 * Environment configuration management
 * Handles environment variables and provides fallbacks
 */

// Check if we're in development mode
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Environment configuration object
export const env = {
  // Firebase configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAxRywmrAPxIER9x8kWicwUWsBKteQ54_s',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'organizadorestudo.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'organizadorestudo',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'organizadorestudo.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '872263455038',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:872263455038:web:4b1ff1de308bd050689c6f',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WKWKHT1SKD',
  },

  // Application configuration
  app: {
    id: import.meta.env.VITE_APP_ID || 'study-organizer-app',
    name: import.meta.env.VITE_APP_NAME || 'Organizador de Estudos',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Development configuration
  isDevelopment: isDev,
  isProduction: isProd,
  devMode: import.meta.env.VITE_DEV_MODE === 'true' || isDev,
  logLevel: import.meta.env.VITE_LOG_LEVEL || (isDev ? 'debug' : 'error'),
};

// Validate Firebase configuration
export const validateFirebaseConfig = () => {
  const { firebase } = env;

  if (!firebase.apiKey || !firebase.projectId || !firebase.authDomain) {
    console.warn('Firebase configuration is incomplete.');
    return false;
  }

  return true;
};

// Export individual configs for convenience
export const firebaseConfig = env.firebase;
export const appConfig = env.app;

export default env;
