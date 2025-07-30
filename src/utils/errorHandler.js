/**
 * Error handling utilities
 */
import { logger } from './logger';

// Firebase error code mappings to user-friendly messages
const FIREBASE_ERROR_MESSAGES = {
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/email-already-in-use': 'Este email já está em uso.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'Email inválido.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'firestore/permission-denied': 'Permissão negada. Faça login novamente.',
  'firestore/unavailable': 'Serviço temporariamente indisponível.',
  'firestore/not-found': 'Documento não encontrado.',
};

/**
 * Get user-friendly error message from Firebase error
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) {
    return 'Ocorreu um erro inesperado.';
  }

  return FIREBASE_ERROR_MESSAGES[error.code] || 'Erro no servidor. Tente novamente.';
};

/**
 * Handle Firebase errors
 */
export const handleFirebaseError = (error, operation = 'operação') => {
  const message = getFirebaseErrorMessage(error);

  logger.error(`Firebase error in ${operation}`, {
    code: error.code,
    message: error.message,
    operation,
  });

  return new Error(message);
};

export default {
  getFirebaseErrorMessage,
  handleFirebaseError,
};
