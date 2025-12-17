import { sanitizeText } from './helpers';

const clampNumber = (value, min, max, fallback = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
};

export const sanitizeHexColor = (value, fallback = '#3b82f6') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  return fallback;
};

export const sanitizeCycleConfig = (rawConfig, { maxManualWeight = 10 } = {}) => {
  if (!rawConfig || typeof rawConfig !== 'object') return {};

  const sanitized = {};
  for (const [subjectId, entry] of Object.entries(rawConfig)) {
    if (!subjectId) continue;
    const include = entry?.include !== false;
    const weight = clampNumber(entry?.weight, 0, maxManualWeight, 1);
    sanitized[subjectId] = { include, weight };
  }
  return sanitized;
};

const roundToStep = (value, step) => {
  const num = Number(value);
  if (!Number.isFinite(num) || step <= 0) return 0;
  return Math.round(num / step) * step;
};

export const computeCycleWeightFromTargetHours = (targetHours, maxTargetHours) => {
  const hours = clampNumber(targetHours, 0, Number.MAX_SAFE_INTEGER, 0);
  if (hours <= 0) return 0;
  const max = clampNumber(maxTargetHours, 0, Number.MAX_SAFE_INTEGER, 0);
  if (max <= 0) return 1;

  const ratio = Math.sqrt(hours) / Math.sqrt(max);
  const scaled = ratio * 10;
  return clampNumber(roundToStep(scaled, 0.5), 0, 10, 1);
};

export const buildSubjectsForCycle = ({ subjects, mode, cycleConfig }) => {
  const safeConfig = sanitizeCycleConfig(cycleConfig);
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const maxTargetHours = safeSubjects.reduce((max, subject) => {
    const hours = clampNumber(subject?.targetHours, 0, Number.MAX_SAFE_INTEGER, 0);
    return Math.max(max, hours);
  }, 0);

  return safeSubjects.map((subject, idx) => {
    const id = String(subject?.id ?? '');
    const name = sanitizeText(String(subject?.name ?? 'Matéria')).slice(0, 80);

    const include = safeConfig[id]?.include !== false;

    const manualWeight = clampNumber(safeConfig[id]?.weight, 0, 10, 1);
    const editalWeight = computeCycleWeightFromTargetHours(subject?.targetHours, maxTargetHours);
    const weight = mode === 'edital' ? editalWeight : manualWeight;

    return {
      ...subject,
      id,
      name,
      include,
      weight,
      _idx: idx,
      _targetHours: clampNumber(subject?.targetHours, 0, Number.MAX_SAFE_INTEGER, 0)
    };
  });
};

export const pickNextTopicForSubject = (syllabusItems, subjectId, excludedItemIds = []) => {
  const subjectIdStr = String(subjectId ?? '');
  const excludedList = Array.isArray(excludedItemIds) ? excludedItemIds : [excludedItemIds];
  const excluded = new Set(excludedList.map((id) => String(id ?? '')));

  const items = (Array.isArray(syllabusItems) ? syllabusItems : []).filter(i =>
    String(i?.subjectId ?? '') === subjectIdStr && !excluded.has(String(i?.id ?? ''))
  );
  if (!items.length) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const sorted = [...items].sort((a, b) => {
    // 1. High Priority: Due Reviews
    // Item is eligible for review if isStudied=true AND nextReviewDate <= Today
    const aIsDue = a?.isStudied && a?.nextReviewDate && a.nextReviewDate <= todayStr;
    const bIsDue = b?.isStudied && b?.nextReviewDate && b.nextReviewDate <= todayStr;

    if (aIsDue && !bIsDue) return -1;
    if (!aIsDue && bIsDue) return 1;

    // 2. If both due, pick earliest review date
    if (aIsDue && bIsDue) {
      return a.nextReviewDate.localeCompare(b.nextReviewDate);
    }

    // 3. Fallback: Not due. Prefer "Not Studied" over "Studied" (Standard flow)
    const aStudied = a?.isStudied ? 1 : 0;
    const bStudied = b?.isStudied ? 1 : 0;
    if (aStudied !== bStudied) return aStudied - bStudied;

    const aAcc = a?.accuracy ?? 101;
    const bAcc = b?.accuracy ?? 101;
    if (aAcc !== bAcc) return aAcc - bAcc;

    const aCreated = new Date(a?.createdAt || 0).getTime();
    const bCreated = new Date(b?.createdAt || 0).getTime();
    return aCreated - bCreated;
  });

  return sorted[0] || null;
};

/**
 * Generates a batch of subjects for the cycle based on weights using
 * Smooth Weighted Round-Robin (SWRR) to ensure a deterministic, fair, 
 * and "one-after-another" distributed sequence.
 */
export const generateCycleBatch = (subjectsForCycle, minLength = 20) => {
  const active = (Array.isArray(subjectsForCycle) ? subjectsForCycle : [])
    .filter(s => s?.include && Number(s?.weight) > 0)
    // Sort by name or index to ensure deterministic starting order before weights apply
    .sort((a, b) => a._idx - b._idx);

  if (!active.length) return [];
  if (active.length === 1) {
    return Array.from({ length: minLength }, () => ({ id: active[0].id, name: active[0].name }));
  }

  // Clone active subjects with their operational state for SWRR
  let state = active.map(s => ({
    id: s.id,
    name: s.name,
    weight: clampNumber(s.weight, 0, 100, 0), // Ensure positive
    current: 0
  }));

  const totalWeight = state.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return []; // Should be caught above but safety first

  // Generate enough items to fill minLength
  // Note: SWRR period is roughly the sum of weights (if integers).
  // We just generate N items content-agnostically.
  const result = [];

  for (let i = 0; i < minLength; i++) {
    // 1. Increase current by weight
    for (const s of state) {
      s.current += s.weight;
    }

    // 2. Pick subject with highest current
    //    If tie, prefer the one appearing earlier in list (deterministic)
    const best = state.reduce((prev, curr) =>
      (curr.current > prev.current) ? curr : prev
      , state[0]);

    // 3. Add to result
    result.push({ id: best.id, name: best.name });

    // 4. Decrease current by total weight
    best.current -= totalWeight;
  }

  return result;
};

// Deprecated alias
export const buildWeightedQueue = (subjects, slots, last) => {
  return generateCycleBatch(subjects, slots);
};
