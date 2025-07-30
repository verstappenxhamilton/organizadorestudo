/**
 * Firebase configuration and initialization
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, validateFirebaseConfig } from '../config/environment';
import { logger } from '../utils/logger';

// Validate configuration
const isValidConfig = validateFirebaseConfig();

if (!isValidConfig) {
  console.warn('Firebase configuration may be incomplete');
}

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  logger.info('Firebase initialized successfully', {
    projectId: firebaseConfig.projectId,
  });

} catch (error) {
  logger.error('Failed to initialize Firebase', { error: error.message });
  console.warn('Firebase initialization failed, some features may not work:', error.message);
}

// Export Firebase instances
export { app, auth, db };

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!(app && auth && db);
};

export default {
  app,
  auth,
  db,
  isFirebaseInitialized,
};
