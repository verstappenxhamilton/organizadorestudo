import { loadFromLocalStorage, saveToLocalStorage } from './localStorage';
import { normalizeEditalText, splitEditalTextVariants } from './editalMatching';

const GLOBAL_PROGRESS_KEY = 'global_syllabus_progress';

export const loadGlobalProgress = () => {
  const saved = loadFromLocalStorage(GLOBAL_PROGRESS_KEY, {});
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
};

export const saveGlobalProgress = (progressMap) => {
  saveToLocalStorage(GLOBAL_PROGRESS_KEY, progressMap || {});
};

export const getProgressKeysForName = (name) => {
  if (!name) return [];
  const variants = splitEditalTextVariants(name);
  const keys = variants
    .map((variant) => normalizeEditalText(variant))
    .filter(Boolean);

  return Array.from(new Set(keys));
};

export const isNameStudiedInProgress = (name, progressMap) => {
  const keys = getProgressKeysForName(name);
  return keys.some((key) => progressMap?.[key]?.isStudied);
};

export const updateProgressForName = (name, progressMap, isStudied) => {
  const keys = getProgressKeysForName(name);
  if (keys.length === 0) return progressMap;

  const next = { ...progressMap };
  const updatedAt = new Date().toISOString();
  keys.forEach((key) => {
    next[key] = {
      isStudied: Boolean(isStudied),
      updatedAt
    };
  });

  return next;
};
