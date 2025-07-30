/**
 * Authentication hook
 */
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { logger } from '../utils/logger';
import { handleFirebaseError } from '../utils/errorHandler';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      setIsAuthReady(true);
      logger.warn('Firebase auth not initialized');
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsLoading(false);
        setIsAuthReady(true);
        setError(null);
        
        if (user) {
          logger.info('User authenticated', { uid: user.uid });
        } else {
          logger.info('User not authenticated');
        }
      },
      (error) => {
        const appError = handleFirebaseError(error, 'authentication state change');
        setError(appError);
        setIsLoading(false);
        setIsAuthReady(true);
        logger.error('Auth state change error', { error: error.message });
      }
    );

    return () => unsubscribe();
  }, []);

  const signInAnonymous = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signInAnonymously(auth);
      logger.info('Anonymous sign in successful', { uid: result.user.uid });
      return result.user;
    } catch (error) {
      const appError = handleFirebaseError(error, 'anonymous sign in');
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      await signOut(auth);
      logger.info('User signed out');
    } catch (error) {
      const appError = handleFirebaseError(error, 'sign out');
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthReady,
    error,
    signInAnonymous,
    logout,
    isAuthenticated: !!user,
    userId: user?.uid || null,
  };
};

export default useAuth;
