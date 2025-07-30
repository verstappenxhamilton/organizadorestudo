/**
 * Simple logging utility
 */

// Simple logger object
export const logger = {
  error: (message, context = {}) => {
    console.error(`[ERROR] ${message}`, context);
  },
  warn: (message, context = {}) => {
    console.warn(`[WARN] ${message}`, context);
  },
  info: (message, context = {}) => {
    console.info(`[INFO] ${message}`, context);
  },
};

// Helper function to log Firebase errors
export const logFirebaseError = (operation, error, context = {}) => {
  logger.error(`Firebase ${operation} failed`, {
    error: error.message,
    code: error.code,
    ...context,
  });
};

export default logger;
