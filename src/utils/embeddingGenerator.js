import { pipeline } from '@xenova/transformers';

class EmbeddingGenerator {
    static instance = null;
    static modelName = 'Xenova/all-MiniLM-L6-v2';

    static async getInstance() {
        if (!this.instance) {
            console.log("Loading embedding model...");
            this.instance = await pipeline('feature-extraction', this.modelName);
            console.log("Embedding model loaded.");
        }
        return this.instance;
    }

    /**
     * Generates an embedding for a given text.
     * @param {string} text
     * @returns {Promise<number[]>}
     */
    static async generate(text) {
        const extractor = await this.getInstance();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        // Output is a Tensor, we want a regular array
        return Array.from(output.data);
    }
}

export default EmbeddingGenerator;
