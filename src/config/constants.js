/**
 * Application constants
 */

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
};

// Task states
export const TASK_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// Filter types for syllabus items
export const SYLLABUS_FILTERS = {
  ALL: 'all',
  NOT_STUDIED: 'notStudied',
  SCHEDULED: 'scheduled',
  STUDIED_NO_REVIEW: 'studiedNoReview',
};

// Score thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
};

// Review schedule options (in days)
export const REVIEW_SCHEDULE_OPTIONS = [
  { label: '1 dia', days: 1 },
  { label: '4 dias', days: 4 },
  { label: '7 dias', days: 7 },
  { label: '15 dias', days: 15 },
  { label: '30 dias', days: 30 },
  { label: '45 dias', days: 45 },
];

// Exam weight thresholds
export const EXAM_WEIGHT_THRESHOLDS = {
  VERY_HIGH: 75,
  HIGH: 50,
  MEDIUM: 25,
};

// Default values
export const DEFAULTS = {
  TOAST_DURATION: 3000,
  SESSION_DURATION_STEP: 0.1,
  MIN_SESSION_DURATION: 0.1,
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  MAX_EXAM_WEIGHT: 100,
  MIN_EXAM_WEIGHT: 0,
};

// CSS classes for reuse
export const CSS_CLASSES = {
  INPUT_STYLE: 'mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100',
  BTN_PRIMARY: 'px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-sky-400 transition-colors',
  BTN_SECONDARY: 'mr-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors',
  BTN_DANGER: 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors',
  CUSTOM_SCROLLBAR: 'custom-scrollbar',
};

export default {
  TOAST_TYPES,
  MODAL_SIZES,
  TASK_STATES,
  SYLLABUS_FILTERS,
  SCORE_THRESHOLDS,
  REVIEW_SCHEDULE_OPTIONS,
  EXAM_WEIGHT_THRESHOLDS,
  DEFAULTS,
  CSS_CLASSES,
};
