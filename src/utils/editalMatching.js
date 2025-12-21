import { sanitizeText } from './helpers';

const STOP_WORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'para',
  'por',
  'ao',
  'aos'
]);

export const normalizeEditalText = (text) => {
  if (!text) return '';
  const base = sanitizeText(String(text))
    .replace(/^\d+(?:\.\d+)*\.?\s*/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const cleaned = base
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  const tokens = cleaned.split(' ').filter((token) => token && !STOP_WORDS.has(token));
  return tokens.join(' ').trim();
};

export const splitEditalTextVariants = (text) => {
  if (!text) return [];
  const cleaned = sanitizeText(String(text));
  if (!cleaned) return [];

  const segments = cleaned
    .split(/\s*;\s*/g)
    .map((segment) => sanitizeText(segment))
    .filter(Boolean);

  return segments.length > 0 ? segments : [cleaned];
};

export const tokenizeNormalizedText = (normalizedText) => {
  if (!normalizedText) return [];
  return normalizedText.split(' ').filter(Boolean);
};

export const isSimilarNormalizedText = (candidate, target, threshold = 0.75) => {
  if (!candidate || !target) return false;
  if (candidate === target) return true;
  if (candidate.includes(target) || target.includes(candidate)) return true;

  const candidateTokens = new Set(tokenizeNormalizedText(candidate));
  const targetTokens = new Set(tokenizeNormalizedText(target));
  if (candidateTokens.size === 0 || targetTokens.size === 0) return false;

  let intersection = 0;
  candidateTokens.forEach((token) => {
    if (targetTokens.has(token)) intersection += 1;
  });

  const union = new Set([...candidateTokens, ...targetTokens]).size;
  const similarity = union === 0 ? 0 : intersection / union;
  return similarity >= threshold;
};

export const resolveEditalTextKey = (rawText, existingKeys) => {
  const normalized = normalizeEditalText(rawText);
  if (!normalized) return '';
  if (existingKeys.has(normalized)) return normalized;

  for (const key of existingKeys) {
    if (isSimilarNormalizedText(normalized, key)) {
      return key;
    }
  }

  return normalized;
};
