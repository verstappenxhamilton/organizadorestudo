
/**
 * Calculates Cosine Similarity between two vectors.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Score between -1 and 1
 */
export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class SemanticMatcher {
    constructor() {
        // Cache or state can go here
    }

    /**
     * Finds the best match for a query vector among a list of candidates.
     * @param {number[]} queryEmbedding
     * @param {Array<{embedding: number[], item: any}>} candidates
     * @param {number} threshold
     * @returns {{ item: any, score: number } | null}
     */
    findBestMatch(queryEmbedding, candidates, threshold = 0.8) {
        let bestScore = -1;
        let bestItem = null;

        for (const candidate of candidates) {
            if (!candidate.embedding) continue;
            const score = cosineSimilarity(queryEmbedding, candidate.embedding);
            if (score > bestScore) {
                bestScore = score;
                bestItem = candidate.item;
            }
        }

        if (bestScore >= threshold) {
            return { item: bestItem, score: bestScore };
        }
        return null;
    }
}
