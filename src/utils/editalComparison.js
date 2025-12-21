const STOPWORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'a',
  'o',
  'as',
  'os',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'para',
  'por',
  'ao',
  'aos',
  'à',
  'às'
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizeStudyName = (value) => {
  if (!value || typeof value !== 'string') return '';

  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/^\s*\d+(?:\.\d+)*(?:[.)-])?\s*/, '')
    .replace(/[–—:/;,-]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOPWORDS.has(word))
    .join(' ')
    .trim();
};

const getEditalMateriaNames = (edital) =>
  (Array.isArray(edital?.materias) ? edital.materias : [])
    .map((materia) => (typeof materia === 'string' ? materia : materia?.nome))
    .filter(Boolean);

const getEditalTopicos = (edital) =>
  (Array.isArray(edital?.itensEdital) ? edital.itensEdital : [])
    .map((item) => (typeof item === 'string' ? item : item?.nome))
    .filter(Boolean);

const pickSubjectForTopic = (topic, subjects) => {
  if (!topic || subjects.length === 0) return null;
  const trimmed = topic.trim();
  for (const subject of subjects) {
    if (!subject?.name) continue;
    const directMatch = new RegExp(`^\\s*${escapeRegExp(subject.name)}\\s*[:\-–—]`, 'i');
    if (directMatch.test(trimmed)) return subject;
  }

  const normalizedTopic = normalizeStudyName(trimmed);
  if (!normalizedTopic) return null;

  return subjects.find((subject) => normalizedTopic.startsWith(subject.key)) || null;
};

const getOrCreateSubject = (subjectMap, subjectName) => {
  const key = normalizeStudyName(subjectName);
  if (!key) return null;
  if (!subjectMap.has(key)) {
    subjectMap.set(key, {
      key,
      name: subjectName,
      sources: new Set(),
      topics: new Map()
    });
  } else {
    const existing = subjectMap.get(key);
    if (existing && subjectName.length > existing.name.length) {
      existing.name = subjectName;
    }
  }
  return subjectMap.get(key);
};

const getOrCreateTopic = (topicMap, topicName) => {
  const key = normalizeStudyName(topicName);
  if (!key) return null;
  if (!topicMap.has(key)) {
    topicMap.set(key, {
      key,
      name: topicName,
      sources: new Set()
    });
  } else {
    const existing = topicMap.get(key);
    if (existing && topicName.length > existing.name.length) {
      existing.name = topicName;
    }
  }
  return topicMap.get(key);
};

export const mergeEditais = (editais) => {
  const subjectMap = new Map();
  const totalEditais = editais.length;

  editais.forEach((edital) => {
    const editalId = edital?.id || edital?.nome || Math.random().toString(36);
    const materias = getEditalMateriaNames(edital);
    const subjects = materias
      .map((name) => ({ name, key: normalizeStudyName(name) }))
      .filter((subject) => subject.key);

    if (subjects.length === 0 && getEditalTopicos(edital).length > 0) {
      subjects.push({ name: 'Tópicos Gerais', key: normalizeStudyName('Tópicos Gerais') });
    }

    subjects.forEach((subject) => {
      const entry = getOrCreateSubject(subjectMap, subject.name);
      if (entry) entry.sources.add(editalId);
    });

    const topics = getEditalTopicos(edital);
    topics.forEach((topic) => {
      const subject = pickSubjectForTopic(topic, subjects);
      const subjectName = subject?.name || 'Tópicos Gerais';
      const subjectEntry = getOrCreateSubject(subjectMap, subjectName);
      if (!subjectEntry) return;
      subjectEntry.sources.add(editalId);

      const topicEntry = getOrCreateTopic(subjectEntry.topics, topic);
      if (topicEntry) topicEntry.sources.add(editalId);
    });
  });

  const mergedSubjects = Array.from(subjectMap.values()).map((subject) => ({
    key: subject.key,
    name: subject.name,
    count: subject.sources.size,
    totalEditais,
    topics: Array.from(subject.topics.values()).map((topic) => ({
      key: topic.key,
      name: topic.name,
      count: topic.sources.size,
      totalEditais
    }))
  }));

  mergedSubjects.sort((a, b) => a.name.localeCompare(b.name));
  mergedSubjects.forEach((subject) => {
    subject.topics.sort((a, b) => a.name.localeCompare(b.name));
  });

  return {
    totalEditais,
    subjects: mergedSubjects
  };
};

export const buildStudyContentFromEditais = (editais, profileId) => {
  const merged = mergeEditais(editais);
  const subjects = [];
  const syllabusItems = [];
  const createdAt = new Date().toISOString();
  let seed = Date.now();

  merged.subjects.forEach((subject, subjectIndex) => {
    const subjectId = `${profileId}-${seed + subjectIndex}`;
    subjects.push({
      id: subjectId,
      profileId,
      name: subject.name,
      description: '',
      color: '#3b82f6',
      targetHours: 0,
      normalizedKey: subject.key,
      createdAt
    });

    subject.topics.forEach((topic, topicIndex) => {
      syllabusItems.push({
        id: `${subjectId}-${topicIndex}-${seed}`,
        subjectId,
        name: topic.name,
        normalizedKey: topic.key,
        isStudied: false,
        createdAt
      });
    });

    seed += 1;
  });

  return {
    subjects,
    syllabusItems
  };
};

export const mergeStudyContentWithExisting = (
  editais,
  profileId,
  existingSubjects,
  existingSyllabusItems,
) => {
  const merged = mergeEditais(editais);
  const subjects = [];
  const syllabusItems = [];
  const createdAt = new Date().toISOString();

  const profileSubjects = (Array.isArray(existingSubjects) ? existingSubjects : []).filter(
    (subject) => subject.profileId === profileId,
  );
  const subjectByKey = new Map();
  profileSubjects.forEach((subject) => {
    const key = subject.normalizedKey || normalizeStudyName(subject.name);
    if (!key) return;
    subjectByKey.set(key, subject);
  });

  const itemsBySubjectKey = new Map();
  (Array.isArray(existingSyllabusItems) ? existingSyllabusItems : []).forEach((item) => {
    const subject = profileSubjects.find((s) => s.id === item.subjectId);
    const subjectKey = subject?.normalizedKey || normalizeStudyName(subject?.name || '');
    if (!subjectKey) return;
    const topicKey = item.normalizedKey || normalizeStudyName(item.name);
    if (!topicKey) return;
    if (!itemsBySubjectKey.has(subjectKey)) {
      itemsBySubjectKey.set(subjectKey, new Map());
    }
    itemsBySubjectKey.get(subjectKey).set(topicKey, item);
  });

  merged.subjects.forEach((subject, subjectIndex) => {
    const subjectKey = subject.key || normalizeStudyName(subject.name);
    const existingSubject = subjectByKey.get(subjectKey);
    const subjectId = existingSubject?.id || `${profileId}-${Date.now()}-${subjectIndex}`;

    subjects.push({
      id: subjectId,
      profileId,
      name: existingSubject?.name && existingSubject.name.length >= subject.name.length
        ? existingSubject.name
        : subject.name,
      description: existingSubject?.description || '',
      color: existingSubject?.color || '#3b82f6',
      targetHours: existingSubject?.targetHours || 0,
      normalizedKey: subjectKey,
      createdAt: existingSubject?.createdAt || createdAt
    });

    const existingTopics = itemsBySubjectKey.get(subjectKey) || new Map();
    subject.topics.forEach((topic, topicIndex) => {
      const topicKey = topic.key || normalizeStudyName(topic.name);
      if (!topicKey) return;
      const existingItem = existingTopics.get(topicKey);
      syllabusItems.push({
        id: existingItem?.id || `${subjectId}-${topicIndex}-${Date.now()}`,
        subjectId,
        name: existingItem?.name && existingItem.name.length >= topic.name.length
          ? existingItem.name
          : topic.name,
        normalizedKey: topicKey,
        isStudied: existingItem?.isStudied || false,
        nextReviewDate: existingItem?.nextReviewDate,
        createdAt: existingItem?.createdAt || createdAt
      });
    });
  });

  return { subjects, syllabusItems };
};
