const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const EDITAIS_DIR = './editais';
const OUTPUT_FILE = './src/data/parsedEditais.json';

// Simple Levenshtein implementation for performance
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Utility to normalize text for comparison
function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function cleanTopicText(text) {
    return text
        .replace(/^(\d+(\.\d+)*\.?|[IVX]+\s*[-–.]|[a-z]\))\s+/, '') // Remove "1.", "1.1", "I -", "a)"
        .trim();
}

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

// Optimized Canonical Logic
function assignCanonicalIds(allEditais) {
    // Map of FirstChar -> Array of { id, text }
    // This reduces the search space by ~26x
    const canonicalIndex = {};
    let canonicalCounter = 0;

    allEditais.forEach(edital => {
        edital.materias.forEach(materia => {
            materia.topics.forEach((topicText, tIdx) => {
                const cleanedText = cleanTopicText(topicText);
                if (cleanedText.length < 2) {
                     // Skip garbage
                     materia.topics[tIdx] = { original: topicText, cleaned: cleanedText, canonicalId: `junk-${Math.random()}` };
                     return;
                }

                const firstChar = cleanedText.charAt(0).toUpperCase();
                if (!canonicalIndex[firstChar]) canonicalIndex[firstChar] = [];

                // Search in the bucket
                const candidates = canonicalIndex[firstChar];
                let match = null;

                // 1. Exact match (fastest)
                match = candidates.find(c => c.text === cleanedText);

                // 2. Fuzzy match (slower)
                if (!match) {
                    for (const cand of candidates) {
                        // Optimization: Length difference check
                        if (Math.abs(cand.text.length - cleanedText.length) > 5) continue;

                        const dist = levenshtein(cand.text, cleanedText);
                        // Allow 15% difference
                        const threshold = Math.max(2, Math.floor(cand.text.length * 0.15));

                        if (dist <= threshold) {
                            match = cand;
                            break;
                        }
                    }
                }

                let assignedId;
                if (match) {
                    assignedId = match.id;
                } else {
                    canonicalCounter++;
                    assignedId = `can-${canonicalCounter}`;
                    const newEntry = { id: assignedId, text: cleanedText };
                    candidates.push(newEntry);
                }

                materia.topics[tIdx] = {
                    original: topicText,
                    cleaned: cleanedText,
                    canonicalId: assignedId
                };
            });
        });
    });
}

async function run() {
    const files = fs.readdirSync(EDITAIS_DIR).filter(f => f.endsWith('.pdf'));
    const results = [];

    console.log(`Found ${files.length} PDFs.`);

    for (const file of files) {
        console.log(`Parsing ${file}...`);
        try {
            const text = await parsePdf(path.join(EDITAIS_DIR, file));
            const parsed = advancedHeuristics(text, file);
            results.push(parsed);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    console.log("Building Canonical Knowledge Base (Optimized)...");
    assignCanonicalIds(results);

    // Flatten structure for the app
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
