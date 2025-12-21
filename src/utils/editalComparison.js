import {
  normalizeEditalText,
  resolveEditalTextKey,
  splitEditalTextVariants
} from './editalMatching';
import { sanitizeText } from './helpers';

const normalizeItemLabel = (text) => sanitizeText(String(text || '')).slice(0, 220);

const extractItemNames = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (item?.nome) return [item.nome];
      if (item?.name) return [item.name];
      return [];
    })
    .map((item) => normalizeItemLabel(item))
    .filter(Boolean);
};

const addItemToGroups = (groups, rawText, sourceId, sourceLabel) => {
  const existingKeys = new Set(groups.map((group) => group.key));
  const key = resolveEditalTextKey(rawText, existingKeys);
  if (!key) return;

  let group = groups.find((item) => item.key === key);
  if (!group) {
    group = {
      key,
      label: normalizeItemLabel(rawText),
      normalized: normalizeEditalText(rawText),
      sources: new Set(),
      labels: new Set()
    };
    groups.push(group);
  }

  group.sources.add(sourceId);
  if (sourceLabel) group.labels.add(sourceLabel);
  if (rawText) group.labels.add(normalizeItemLabel(rawText));
};

export const mergeEditaisContent = (editais) => {
  const materiasGroups = [];
  const topicosGroups = [];

  (Array.isArray(editais) ? editais : []).forEach((edital) => {
    const sourceId = edital?.id;
    const sourceLabel = normalizeItemLabel(edital?.nome || edital?.concurso || '');

    const materias = extractItemNames(edital?.materias);
    materias.forEach((materia) => addItemToGroups(materiasGroups, materia, sourceId, sourceLabel));

    const itens = extractItemNames(edital?.itensEdital);
    itens
      .flatMap((item) => splitEditalTextVariants(item))
      .forEach((topico) => addItemToGroups(topicosGroups, topico, sourceId, sourceLabel));
  });

  const formatGroup = (group, totalSources) => {
    const sources = Array.from(group.sources || []);
    const labels = Array.from(group.labels || []);
    const label = group.label || labels[0] || '';

    return {
      key: group.key,
      label,
      sources,
      labels,
      count: sources.length,
      isUnique: sources.length === 1,
      isCommon: sources.length === totalSources && totalSources > 1
    };
  };

  const totalSources = new Set(
    (Array.isArray(editais) ? editais : [])
      .map((edital) => edital?.id)
      .filter(Boolean)
  ).size;

  return {
    materias: materiasGroups
      .map((group) => formatGroup(group, totalSources))
      .sort((a, b) => a.label.localeCompare(b.label)),
    topicos: topicosGroups
      .map((group) => formatGroup(group, totalSources))
      .sort((a, b) => a.label.localeCompare(b.label))
  };
};
