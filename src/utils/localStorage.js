/**
 * Utility functions for localStorage operations
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @returns {boolean} Success status
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Loaded data or default value
 */
export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
    return false;
  }
};

/**
 * Clear all localStorage data
 * @returns {boolean} Success status
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get localStorage usage information
 * @returns {Object} Usage information
 */
export const getLocalStorageInfo = () => {
  if (!isLocalStorageAvailable()) {
    return { available: false };
  }

  try {
    let totalSize = 0;
    const keys = [];
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        totalSize += key.length + (value ? value.length : 0);
        keys.push(key);
      }
    }

    return {
      available: true,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      keysCount: keys.length,
      keys: keys
    };
  } catch (error) {
    console.error('Erro ao obter informações do localStorage:', error);
    return { available: true, error: error.message };
  }
};

/**
 * Backup all localStorage data
 * @returns {Object} Backup data
 */
export const backupLocalStorage = () => {
  try {
    const backup = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        backup[key] = localStorage.getItem(key);
      }
    }
    return {
      timestamp: new Date().toISOString(),
      data: backup
    };
  } catch (error) {
    console.error('Erro ao fazer backup do localStorage:', error);
    return null;
  }
};

/**
 * Restore localStorage from backup
 * @param {Object} backup - Backup data
 * @returns {boolean} Success status
 */
export const restoreLocalStorage = (backup) => {
  try {
    if (!backup || !backup.data) {
      throw new Error('Backup inválido');
    }

    // Clear existing data
    localStorage.clear();

    // Restore data
    for (let key in backup.data) {
      localStorage.setItem(key, backup.data[key]);
    }

    return true;
  } catch (error) {
    console.error('Erro ao restaurar localStorage:', error);
    return false;
  }
};

export default {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
  isLocalStorageAvailable,
  getLocalStorageInfo,
  backupLocalStorage,
  restoreLocalStorage
};
