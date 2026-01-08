const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Import Transformers.js dynamically or use require if supported (CommonJS)
// @xenova/transformers works in CJS.
let pipeline;
try {
    const transformers = require('@xenova/transformers');
    pipeline = transformers.pipeline;
} catch (e) {
    console.error("Could not load @xenova/transformers. Ensure it is installed.", e);
    process.exit(1);
}

const EDITAIS_DIR = './editais';
const OUTPUT_FILE = './src/data/parsedEditais.json';

// Configuration
const SIMILARITY_THRESHOLD = 0.82; // 0.80-0.85 is usually good for semantic match

// Utility to normalize text for display
function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function cleanTopicText(text) {
    // Remove "1.", "1.1", "a)", "I -"
    return text
        .replace(/^(\d+(\.\d+)*\.?|[IVX]+\s*[-–.]|[a-z]\))\s+/i, '')
        .trim();
}

// Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Global Model
let extractor = null;

async function initModel() {
    console.log("Loading ML Model (Xenova/all-MiniLM-L6-v2)...");
    // Feature Extraction pipeline
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log("Model Loaded.");
}

async function getEmbedding(text) {
    if (!text || text.length < 3) return null;
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    // output is a Tensor. .data is the Float32Array
    return output.data;
}

// Parsing (Same Heuristics as before for structure)
async function parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

function advancedHeuristics(text, fileName) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleanLines = lines.filter(l => !/^\d+\s*of\s*\d+$/i.test(l) && !/^Página\s+\d+/i.test(l));

    const subjects = [];
    let currentSubject = null;
    let topics = [];

    const subjectRegex = /^(DIREITO\s+[A-ZÀ-Ú]+(\s+[A-ZÀ-Ú]+)*|LÍNGUA\s+PORTUGUESA|RACIOCÍNIO\s+LÓGICO|INFORMÁTICA|LEGISLAÇÃO\s+[A-ZÀ-Ú]+|CONHECIMENTOS\s+[A-ZÀ-Ú]+|NOÇÕES\s+DE\s+[A-ZÀ-Ú]+|HUMANÍSTICA|ÉTICA|ESTATUTO|DIREITOS\s+HUMANOS)$/i;

    // Improved Topic Start Regex to catch "1.1." or "1.1" or "a)"
    const topicStartRegex = /^(\d+(\.\d+)*\.?|[IVX]+\s*[-–.]|[a-z]\))\s+/;

    cleanLines.forEach(line => {
        const isSubjectHeader = (
            (subjectRegex.test(line) && line.length < 60) ||
            (line === line.toUpperCase() && line.length > 4 && line.length < 40 && !line.match(/\.$/) && !line.match(/^\d/))
        );

        if (isSubjectHeader) {
            if (currentSubject) {
                subjects.push({ name: currentSubject, topics: [...topics] });
            }
            currentSubject = normalize(line);
            topics = [];
        } else if (currentSubject) {
            // Aggressive splitting by semicolon to handle "dense" blocks
            const parts = line.split(';').map(p => p.trim()).filter(p => p.length > 0);
            parts.forEach(part => {
                topics.push(normalize(part));
            });
        }
    });

    if (currentSubject) {
        subjects.push({ name: currentSubject, topics: [...topics] });
    }

    if (subjects.length === 0) {
        subjects.push({
            name: "Conteúdo Geral",
            topics: cleanLines.filter(l => topicStartRegex.test(l))
        });
    }

    const cleanSubjects = subjects.filter(s => s.topics.length > 0 && !s.name.match(/Página/i));

    return {
        id: path.basename(fileName, '.pdf').replace(/\s+/g, '-').toLowerCase(),
        nome: path.basename(fileName, '.pdf'),
        concurso: path.basename(fileName, '.pdf'),
        banca: "Desconhecida",
        materias: cleanSubjects.map((s, idx) => ({
            id: `m-${idx}`,
            nome: s.name,
            topics: s.topics
        }))
    };
}

// The ML "Brain" - Canonical Registry
const canonicalRegistry = []; // { id, text, embedding, count }

async function assignCanonicalIds(allEditais) {
    let canonicalCounter = 0;

    console.log("Processing topics with ML...");
    const totalEditais = allEditais.length;
    let processed = 0;

    for (const edital of allEditais) {
        processed++;
        console.log(`[${processed}/${totalEditais}] Embedding topics for ${edital.nome}...`);

        for (const materia of edital.materias) {
            for (let tIdx = 0; tIdx < materia.topics.length; tIdx++) {
                const topicOriginal = materia.topics[tIdx];
                const topicClean = cleanTopicText(topicOriginal);

                if (topicClean.length < 3) {
                     materia.topics[tIdx] = { original: topicOriginal, canonicalId: `junk-${Math.random()}` };
                     continue;
                }

                // Generate Embedding
                const embedding = await getEmbedding(topicClean);
                if (!embedding) {
                    materia.topics[tIdx] = { original: topicOriginal, canonicalId: `junk-${Math.random()}` };
                    continue;
                }

                // Search Registry
                let bestMatch = null;
                let maxSim = -1;

                // Optimization: Only search topics with similar length? Or naive loop (slow but accurate)
                // Naive loop over all canonical topics is fine for < 5000 topics on modern CPU.
                // Let's optimize: Filter by keyword overlap first? No, embeddings are semantic.
                // Just Loop.

                for (const canonical of canonicalRegistry) {
                    const sim = cosineSimilarity(embedding, canonical.embedding);
                    if (sim > maxSim) {
                        maxSim = sim;
                        bestMatch = canonical;
                    }
                }

                let assignedId;
                if (bestMatch && maxSim >= SIMILARITY_THRESHOLD) {
                    // Match found!
                    assignedId = bestMatch.id;
                    bestMatch.count++;
                    // Optional: Average the embedding to "center" the canonical topic?
                    // Let's keep the first one as anchor for stability.
                } else {
                    // New Canonical Topic
                    canonicalCounter++;
                    assignedId = `can-${canonicalCounter}`;
                    canonicalRegistry.push({
                        id: assignedId,
                        text: topicClean,
                        embedding: embedding,
                        count: 1
                    });
                }

                materia.topics[tIdx] = {
                    original: topicOriginal,
                    cleaned: topicClean,
                    canonicalId: assignedId,
                    similarity: maxSim > 0 ? maxSim.toFixed(2) : 0
                };
            }
        }
    }
    console.log(`Total Unique Canonical Topics: ${canonicalRegistry.length}`);
}

async function run() {
    await initModel();

    const files = fs.readdirSync(EDITAIS_DIR).filter(f => f.endsWith('.pdf'));
    const results = [];

    console.log(`Found ${files.length} PDFs.`);

    // 1. Parse Text
    for (const file of files) {
        console.log(`Parsing Text ${file}...`);
        try {
            const text = await parsePdf(path.join(EDITAIS_DIR, file));
            const parsed = advancedHeuristics(text, file);
            results.push(parsed);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    // 2. ML Clustering
    await assignCanonicalIds(results);

    // 3. Flatten & Save
    const finalData = results.map(r => {
        const materias = [];
        const itensEdital = [];

        r.materias.forEach((m, mIdx) => {
            const mId = `${r.id}-m-${mIdx}`;
            materias.push({ id: mId, nome: m.nome });

            m.topics.forEach((tObj, tIdx) => {
                itensEdital.push({
                    id: `${r.id}-t-${mIdx}-${tIdx}`,
                    nome: tObj.original,
                    canonicalId: tObj.canonicalId,
                    materiaId: mId
                });
            });
        });

        return {
            id: r.id,
            nome: r.nome,
            concurso: r.concurso,
            banca: r.banca,
            materias,
            itensEdital
        };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(`Saved to ${OUTPUT_FILE}`);
}

run();
