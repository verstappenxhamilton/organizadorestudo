
import Fuse from 'fuse.js';
import { cosineSimilarity } from './semanticMatcher';

/**
 * Merges multiple syllabi (editais) into a unified structure, respecting Subject hierarchy.
 *
 * @param {Array} editais - List of Edital objects
 * @param {Array} userSyllabusItems - List of user's current syllabus items
 * @returns {Array} List of Merged Subjects: [{ name, editalIds, topics: [mergedTopics] }]
 */
export const mergeSyllabi = (editais, userSyllabusItems = []) => {
    if (!editais || editais.length === 0) return [];

    // Pre-process user items
    const studiedItems = userSyllabusItems.filter(i => i.isStudied);
    const studiedGlobalIds = new Set(studiedItems.map(i => i.globalId).filter(Boolean));
    const studiedNames = new Set(studiedItems.map(i => normalizeName(i.name)));

    function normalizeName(name) {
        if (!name) return "";
        return name.toLowerCase()
            .replace(/^\d+(\.\d+)*\.?\s+/, '')
            .replace(/^-\s+/, '')
            .trim();
    }

    const isTopicStudied = (originalIdsMap, topicName) => {
        const globalIds = Object.values(originalIdsMap);
        if (globalIds.some(id => studiedGlobalIds.has(id))) return true;
        const normName = normalizeName(topicName);
        return studiedNames.has(normName);
    };

    // 1. Cluster Subjects
    const mergedSubjects = [];
    const allSubjects = [];
    editais.forEach(edital => {
        edital.materias.forEach(m => {
            allSubjects.push({ ...m, editalId: edital.id });
        });
    });

    allSubjects.forEach(rawSub => {
        let match = mergedSubjects.find(ms => ms.name.toLowerCase() === rawSub.nome.toLowerCase());
        if (!match) {
            const fuse = new Fuse(mergedSubjects, { keys: ['name'], threshold: 0.3 });
            const result = fuse.search(rawSub.nome);
            if (result.length > 0) {
                match = result[0].item;
            }
        }

        if (match) {
            if (!match.editalIds.includes(rawSub.editalId)) {
                match.editalIds.push(rawSub.editalId);
            }
            match.rawIds.push({ editalId: rawSub.editalId, id: rawSub.id });
        } else {
            mergedSubjects.push({
                name: rawSub.nome,
                editalIds: [rawSub.editalId],
                rawIds: [{ editalId: rawSub.editalId, id: rawSub.id }],
                topics: []
            });
        }
    });

    // 2. Merge Topics WITHIN Subjects
    mergedSubjects.forEach(ms => {
        const relevantTopics = [];
        ms.rawIds.forEach(ref => {
            const edital = editais.find(e => e.id === ref.editalId);
            const editalTopics = edital.itensEdital.filter(item => item.materiaId === ref.id);
            editalTopics.forEach(t => {
                relevantTopics.push({ ...t, editalId: edital.id });
            });
        });

        const mergedTopics = [];
        const fuseOptions = {
            keys: ['cleanName'],
            includeScore: true,
            threshold: 0.4,
            ignoreLocation: true
        };

        relevantTopics.forEach(topic => {
            const cleanName = normalizeName(topic.nome);
            let bestMatch = null;
            let bestScore = -1;

            // Semantic Match First
            if (topic.embedding) {
                for (const existing of mergedTopics) {
                    if (existing.embedding) {
                        const score = cosineSimilarity(topic.embedding, existing.embedding);
                        // console.log(`Comparing ${topic.nome} vs ${existing.nome}: ${score}`);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = existing;
                        }
                    }
                }

                if (bestScore < 0.85) {
                    bestMatch = null;
                }
            }

            // Fallback to Fuzzy if no semantic match
            if (!bestMatch && mergedTopics.length > 0) {
                const fuse = new Fuse(mergedTopics, fuseOptions);
                const results = fuse.search(cleanName);
                if (results.length > 0) {
                    const fMatch = results[0];
                    if (fMatch.score < 0.35) {
                        bestMatch = fMatch.item;
                    }
                }
            }

            if (bestMatch) {
                if (!bestMatch.editalIds.includes(topic.editalId)) {
                    bestMatch.editalIds.push(topic.editalId);
                }
                bestMatch.originalIds[topic.editalId] = topic.id;
                // Keep longest name
                if (topic.nome.length > bestMatch.nome.length) {
                    bestMatch.nome = topic.nome;
                    bestMatch.cleanName = cleanName;
                    if (topic.embedding) bestMatch.embedding = topic.embedding;
                }
            } else {
                mergedTopics.push({
                    id: topic.id,
                    nome: topic.nome,
                    cleanName: cleanName,
                    embedding: topic.embedding,
                    editalIds: [topic.editalId],
                    originalIds: { [topic.editalId]: topic.id },
                    isStudied: false
                });
            }
        });

        // Finalize
        mergedTopics.forEach(topic => {
            topic.isUnique = topic.editalIds.length === 1 && editais.length > 1;
            topic.isStudied = isTopicStudied(topic.originalIds, topic.nome);
        });

        ms.topics = mergedTopics;
    });

    return mergedSubjects;
};
