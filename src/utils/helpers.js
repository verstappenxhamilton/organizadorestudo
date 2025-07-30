/**
 * General utility helper functions
 */

/**
 * Format date to local string
 * @param {Date|Object} date - Date object or Firestore timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    // Handle Firestore timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('pt-BR');
    }
    
    // Handle regular Date object
    if (date instanceof Date) {
      return date.toLocaleDateString('pt-BR');
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('pt-BR');
    }
    
    return '';
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

/**
 * Format duration in hours to readable string
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration string
 */
export const formatDuration = (hours) => {
  if (!hours || hours <= 0) return '0h';
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  }
  
  if (hours % 1 === 0) {
    return `${hours}h`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}min`;
};

/**
 * Calculate percentage with proper rounding
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {number} Percentage value
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID (default: 8)
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate score (0-100)
 * @param {number|string} score - Score to validate
 * @returns {boolean} True if valid score
 */
export const isValidScore = (score) => {
  const numScore = Number(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 100;
};

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

export default {
  formatDate,
  formatDuration,
  calculatePercentage,
  debounce,
  throttle,
  generateId,
  isValidEmail,
  isValidScore,
  sanitizeText,
  deepClone,
  isEmpty,
};
