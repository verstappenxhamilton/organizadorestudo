
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const EDITAIS_DIR = './editais';
const OUTPUT_FILE = './src/data/parsedEditais.json';

// Helper to normalize text
function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
}

async function parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

function heuristics(text, fileName) {
    const subjects = [];
    let currentSubject = null;
    let topics = [];

    // Strategy: Look for blocks.
    // Many editais have "CONHECIMENTOS ESPECÍFICOS" or subject names in CAPS.
    // This is very brittle, but better than nothing.

    // Attempt 1: Split by "Direito..." or typical subject names
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Common subject starters
    const subjectPatterns = [
        /^DIREITO\s+/i,
        /^LÍNGUA PORTUGUESA/i,
        /^RACIOCÍNIO LÓGICO/i,
        /^INFORMÁTICA/i,
        /^LEGISLAÇÃO/i,
        /^CONHECIMENTOS/i,
        /^NOÇÕES DE/i
    ];

    lines.forEach(line => {
        // Check if line looks like a subject header
        const isSubject = subjectPatterns.some(p => p.test(line)) && line.length < 100 && !line.match(/^\d/);

        if (isSubject) {
            if (currentSubject) {
                subjects.push({
                    name: currentSubject,
                    topics: [...topics]
                });
            }
            currentSubject = normalize(line);
            topics = [];
        } else if (currentSubject) {
            // It's a topic
            // Filter out page numbers or short trash
            if (line.length > 5 && !line.match(/^Página/i)) {
                // Try to detect topic start (digits)
                if (line.match(/^\d/) || line.match(/^[a-z]\)/) || line.match(/^-/)) {
                     topics.push(normalize(line));
                } else {
                    // Append to previous topic if it looks like continuation
                    if (topics.length > 0) {
                        topics[topics.length - 1] += " " + normalize(line);
                    } else {
                        topics.push(normalize(line));
                    }
                }
            }
        }
    });

    // Push last
    if (currentSubject) {
        subjects.push({
            name: currentSubject,
            topics: [...topics]
        });
    }

    // Fallback if no subjects found (try to treat whole file as mixed topics if small?)
    // Or simpler: Just create a "Geral" subject
    if (subjects.length === 0) {
        subjects.push({
            name: "Conteúdo do Edital",
            topics: lines.filter(l => l.length > 10 && l.match(/^\d/)) // Heuristic: lines starting with number
        });
    }

    return {
        id: path.basename(fileName, '.pdf').replace(/\s+/g, '-').toLowerCase(),
        nome: path.basename(fileName, '.pdf'),
        concurso: path.basename(fileName, '.pdf'), // Fallback
        banca: "Desconhecida",
        itensEdital: [], // We will populate flat list too if needed
        materias: subjects.map((s, idx) => ({
            id: `subj-${idx}`,
            nome: s.name,
            topics: s.topics.map((t, tidx) => ({
                id: `topic-${idx}-${tidx}`,
                nome: t
            }))
        }))
    };
}

async function run() {
    const files = fs.readdirSync(EDITAIS_DIR).filter(f => f.endsWith('.pdf'));
    const results = [];

    console.log(`Found ${files.length} PDFs.`);

    for (const file of files) {
        console.log(`Parsing ${file}...`);
        try {
            const text = await parsePdf(path.join(EDITAIS_DIR, file));
            const parsed = heuristics(text, file);
            results.push(parsed);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    // Transform into the structure expected by the app (GLOBAL_EDITAIS format)
    // The app expects: { id, nome, materias: [{id, nome}], itensEdital: [{id, nome}] }
    // BUT our new Requirement needs hierarchy: Subject -> Topics.
    // So I will update GLOBAL_EDITAIS structure to be hierarchical OR update the parser to flatten.
    // Better to keep hierarchy for the "Group by Subject" requirement.

    // Let's stick to the structure:
    // materias: [{ id, nome, topics: [] }] -> NO, existing structure was separate.
    // I will Hybridize:
    // materias: [{ id, nome }]
    // itensEdital: [{ id, nome, materiaId }] (Link them!)

    const finalData = results.map(r => {
        const materias = [];
        const itensEdital = [];

        r.materias.forEach((m, mIdx) => {
            const mId = `${r.id}-m-${mIdx}`;
            materias.push({ id: mId, nome: m.nome });

            m.topics.forEach((t, tIdx) => {
                itensEdital.push({
                    id: `${r.id}-t-${mIdx}-${tIdx}`,
                    nome: t.nome,
                    materiaId: mId // Link!
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
