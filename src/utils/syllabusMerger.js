
import Fuse from 'fuse.js';

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
    // We want to group "Direito Constitucional" from A with "Dir. Const." from B.
    const mergedSubjects = [];

    // Collect all raw subjects
    const allSubjects = [];
    editais.forEach(edital => {
        edital.materias.forEach(m => {
            allSubjects.push({ ...m, editalId: edital.id });
        });
    });

    // Merge subjects
    allSubjects.forEach(rawSub => {
        // Try to find existing cluster
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
                topics: [] // Will populate next
            });
        }
    });

    // 2. Merge Topics WITHIN Subjects
    // For each merged subject, we look at the raw subjects it is composed of,
    // and merge their topics.

    mergedSubjects.forEach(ms => {
        const relevantTopics = [];

        // Find all topics belonging to this subject cluster
        ms.rawIds.forEach(ref => {
            const edital = editais.find(e => e.id === ref.editalId);
            // In parsed structure: items are in edital.itensEdital and have materiaId
            // OR in my heuristic parser output I might have put them inside materias?
            // Let's check parser: `materias` has `id, nome`. `itensEdital` has `materiaId`.
            // Wait, previous `globalEditais.js` mock had structure.
            // `parse_editais_manual.cjs` produced:
            // materias: [{ id, nome }], itensEdital: [{ id, nome, materiaId }]

            const editalTopics = edital.itensEdital.filter(item => item.materiaId === ref.id);
            editalTopics.forEach(t => {
                relevantTopics.push({ ...t, editalId: edital.id });
            });
        });

        // Now merge these topics
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
            let bestScore = 1;

            if (mergedTopics.length > 0) {
                const fuse = new Fuse(mergedTopics, fuseOptions);
                const results = fuse.search(cleanName);
                if (results.length > 0) {
                    bestMatch = results[0].item;
                    bestScore = results[0].score;
                }
            }

            if (bestMatch && bestScore < 0.35) {
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

        // Finalize topics
        mergedTopics.forEach(topic => {
            topic.isUnique = topic.editalIds.length === 1 && editais.length > 1;
            topic.isStudied = isTopicStudied(topic.originalIds, topic.nome);

            // Determine source type for coloring
            // We assume a 2-way comparison mainly, but logic works for N.
            // If editalIds contains A but not B -> Unique A
        });

        ms.topics = mergedTopics;
    });

    return mergedSubjects;
};
