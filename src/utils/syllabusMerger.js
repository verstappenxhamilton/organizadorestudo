
import Fuse from 'fuse.js';

/**
 * Merges multiple syllabi (editais) into a unified structure.
 *
 * @param {Array} editais - List of Edital objects (from GLOBAL_EDITAIS)
 * @param {Array} userSyllabusItems - List of user's current syllabus items (for progress checking)
 * @returns {Object} { subjects: [], topics: [] } where topics have 'editalIds' and 'isUnique'
 */
export const mergeSyllabi = (editais, userSyllabusItems = []) => {
    if (!editais || editais.length === 0) return { subjects: [], topics: [] };

    const mergedSubjects = [];
    const mergedTopics = [];

    // Pre-process user items for faster lookup
    // We store studied items by globalId AND by normalized name
    const studiedItems = userSyllabusItems.filter(i => i.isStudied);
    const studiedGlobalIds = new Set(studiedItems.map(i => i.globalId).filter(Boolean));
    const studiedNames = new Set(studiedItems.map(i => normalizeName(i.name)));

    function normalizeName(name) {
        if (!name) return "";
        return name
            .toLowerCase()
            .replace(/^\d+(\.\d+)*\.?\s+/, '') // Remove numbering
            .replace(/^-\s+/, '') // Remove bullets
            .trim();
    }

    // Helper to check if a topic is studied based on user data
    // 1. Check if any original ID is in studiedGlobalIds
    // 2. Check if normalized name matches any studied item name (Universal Progress)
    const isTopicStudied = (originalIdsMap, topicName) => {
        const globalIds = Object.values(originalIdsMap);
        if (globalIds.some(id => studiedGlobalIds.has(id))) return true;

        const normName = normalizeName(topicName);
        if (studiedNames.has(normName)) return true;

        return false;
    };

    // 1. Merge Subjects
    editais.forEach(edital => {
        edital.materias.forEach(materia => {
            let existing = mergedSubjects.find(s => s.name.toLowerCase() === materia.nome.toLowerCase());

            if (!existing) {
                const fuse = new Fuse(mergedSubjects, { keys: ['name'], threshold: 0.3 });
                const result = fuse.search(materia.nome);
                if (result.length > 0) {
                    existing = result[0].item;
                }
            }

            if (existing) {
                if (!existing.editalIds.includes(edital.id)) {
                    existing.editalIds.push(edital.id);
                }
            } else {
                mergedSubjects.push({
                    id: materia.id,
                    name: materia.nome,
                    editalIds: [edital.id],
                    originalIds: { [edital.id]: materia.id }
                });
            }
        });
    });

    // 2. Merge Topics
    const allTopics = [];
    editais.forEach(edital => {
        edital.itensEdital.forEach(item => {
            allTopics.push({ ...item, editalId: edital.id });
        });
    });

    const fuseOptions = {
        keys: ['cleanName'],
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true
    };

    allTopics.forEach(topic => {
        const cleanName = normalizeName(topic.nome);

        let bestMatch = null;
        let bestScore = 1;

        if (mergedTopics.length > 0) {
            const fuse = new Fuse(mergedTopics, fuseOptions);
            const results = fuse.search(cleanName);
            if (results.length > 0) {
                bestMatch = results[0].item;
                bestScore = results[0].score;
            }
        }

        if (bestMatch && bestScore < 0.3) {
            if (!bestMatch.editalIds.includes(topic.editalId)) {
                bestMatch.editalIds.push(topic.editalId);
            }
            bestMatch.originalIds[topic.editalId] = topic.id;

            if (topic.nome.length > bestMatch.nome.length) {
                bestMatch.nome = topic.nome;
                bestMatch.cleanName = cleanName;
            }
        } else {
            mergedTopics.push({
                id: topic.id,
                nome: topic.nome,
                cleanName: cleanName,
                editalIds: [topic.editalId],
                originalIds: { [topic.editalId]: topic.id },
                isStudied: false
            });
        }
    });

    // 3. Mark Unique and Calculate Progress
    mergedTopics.forEach(topic => {
        topic.isUnique = topic.editalIds.length === 1 && editais.length > 1;
        topic.isStudied = isTopicStudied(topic.originalIds, topic.nome);
    });

    return { subjects: mergedSubjects, topics: mergedTopics };
};
