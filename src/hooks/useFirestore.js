/**
 * Firestore operations hook
 */
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, getAppId } from '../services/firebase';
import { logger, logPerformance } from '../utils/logger';
import { handleFirebaseError, asyncErrorHandler } from '../utils/errorHandler';

export const useFirestore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to build document path
  const buildPath = useCallback((userId, profileId, ...pathSegments) => {
    const appId = getAppId();
    const basePath = `/artifacts/${appId}/users/${userId}`;
    
    if (profileId) {
      return `${basePath}/studyProfiles/${profileId}/${pathSegments.join('/')}`;
    }
    
    return `${basePath}/${pathSegments.join('/')}`;
  }, []);

  // Generic document operations
  const createDocument = useCallback(async (collectionPath, data) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const [error, result] = await asyncErrorHandler(
      addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      'create document'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    logPerformance('createDocument', startTime, { collectionPath });
    logger.debug('Document created', { id: result.id, collectionPath });
    
    return result;
  }, []);

  const updateDocument = useCallback(async (documentPath, data, merge = true) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    const [error] = await asyncErrorHandler(
      merge 
        ? setDoc(doc(db, documentPath), updateData, { merge: true })
        : updateDoc(doc(db, documentPath), updateData),
      'update document'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    logPerformance('updateDocument', startTime, { documentPath });
    logger.debug('Document updated', { documentPath });
  }, []);

  const deleteDocument = useCallback(async (documentPath) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const [error] = await asyncErrorHandler(
      deleteDoc(doc(db, documentPath)),
      'delete document'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    logPerformance('deleteDocument', startTime, { documentPath });
    logger.debug('Document deleted', { documentPath });
  }, []);

  const getDocument = useCallback(async (documentPath) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const [error, docSnap] = await asyncErrorHandler(
      getDoc(doc(db, documentPath)),
      'get document'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    logPerformance('getDocument', startTime, { documentPath });
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
  }, []);

  const getCollection = useCallback(async (collectionPath, queryConstraints = []) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, collectionPath), ...queryConstraints);
    
    const [error, querySnapshot] = await asyncErrorHandler(
      getDocs(q),
      'get collection'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    logPerformance('getCollection', startTime, { 
      collectionPath, 
      count: documents.length 
    });
    
    return documents;
  }, []);

  // Real-time subscription
  const useRealtimeCollection = useCallback((collectionPath, queryConstraints = [], dependencies = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (!db) {
        setLoading(false);
        setError(new Error('Firestore not initialized'));
        return;
      }

      const q = query(collection(db, collectionPath), ...queryConstraints);
      
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const documents = [];
          querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          
          setData(documents);
          setLoading(false);
          setError(null);
          
          logger.debug('Realtime collection updated', { 
            collectionPath, 
            count: documents.length 
          });
        },
        (error) => {
          const appError = handleFirebaseError(error, 'realtime collection');
          setError(appError);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [collectionPath, ...dependencies]);

    return { data, loading, error };
  }, []);

  // Batch operations
  const batchWrite = useCallback(async (operations) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    const batch = writeBatch(db);
    
    operations.forEach(({ type, path, data }) => {
      const docRef = doc(db, path);
      
      switch (type) {
        case 'set':
          batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'update':
          batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        default:
          throw new Error(`Unknown batch operation type: ${type}`);
      }
    });

    const [error] = await asyncErrorHandler(
      batch.commit(),
      'batch write'
    );

    setIsLoading(false);
    
    if (error) {
      setError(error);
      throw error;
    }

    logPerformance('batchWrite', startTime, { operationCount: operations.length });
    logger.debug('Batch write completed', { operationCount: operations.length });
  }, []);

  return {
    isLoading,
    error,
    buildPath,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getCollection,
    useRealtimeCollection,
    batchWrite,
    // Firestore utilities
    serverTimestamp,
    where,
    orderBy,
  };
};

export default useFirestore;
