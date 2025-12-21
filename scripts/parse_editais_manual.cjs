const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const EDITAIS_DIR = './editais';
const OUTPUT_FILE = './src/data/parsedEditais.json';

// Utility to normalize text
function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
}

async function parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

function advancedHeuristics(text, fileName) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Clean up lines (remove page numbers, etc.)
    const cleanLines = lines.filter(l => !/^\d+\s*of\s*\d+$/i.test(l) && !/^Página\s+\d+/i.test(l));

    const subjects = [];
    let currentSubject = null;
    let topics = [];

    // Regex for Subject Headers
    // 1. "DIREITO X" (Common)
    // 2. "LÍNGUA PORTUGUESA", "INFORMÁTICA", etc.
    // 3. Must be short (< 60 chars)
    // 4. Often All Caps
    const subjectRegex = /^(DIREITO\s+[A-ZÀ-Ú]+(\s+[A-ZÀ-Ú]+)*|LÍNGUA\s+PORTUGUESA|RACIOCÍNIO\s+LÓGICO|INFORMÁTICA|LEGISLAÇÃO\s+[A-ZÀ-Ú]+|CONHECIMENTOS\s+[A-ZÀ-Ú]+|NOÇÕES\s+DE\s+[A-ZÀ-Ú]+|HUMANÍSTICA|ÉTICA|ESTATUTO|DIREITOS\s+HUMANOS)$/i;

    // Regex for Topics
    // 1. Starts with Number "1.", "1.1", "1)", "I -", "a)"
    const topicStartRegex = /^(\d+(\.\d+)*\.?|[IVX]+\s*[-–.]|[a-z]\))\s+/;

    cleanLines.forEach(line => {
        // Is it a Subject?
        // Heuristic: Short, matches specific keywords OR is ALL CAPS and looks like a header (not a sentence)
        const isSubjectHeader = (
            (subjectRegex.test(line) && line.length < 60) ||
            (line === line.toUpperCase() && line.length > 4 && line.length < 40 && !line.match(/\.$/) && !line.match(/^\d/))
        );

        if (isSubjectHeader) {
            // Save previous
            if (currentSubject) {
                subjects.push({ name: currentSubject, topics: [...topics] });
            }
            currentSubject = normalize(line);
            topics = [];
        } else if (currentSubject) {
            // Processing Topics
            // Check if line starts with a number/bullet
            if (topicStartRegex.test(line)) {
                // New Topic
                topics.push(normalize(line));
            } else {
                // Continuation of previous topic? OR a new topic implicitly?
                // If the previous line ended with ".", likely new topic (even if missing number).
                // If previous line ended with ";", definitely continuation or next item in list.
                // Let's assume continuation if it doesn't look like a header.

                if (topics.length > 0) {
                     // Check if previous topic is very long, maybe we are appending incorrectly?
                     // Actually, many editais split lines mid-sentence.
                     const lastTopic = topics[topics.length - 1];
                     if (!lastTopic.endsWith('.')) {
                         topics[topics.length - 1] += " " + normalize(line);
                     } else {
                         // Previous ended with dot. Does this look like a new sentence?
                         // If it starts with Uppercase, treat as new topic (implicit bullet).
                         // BUT, might be a sub-sentence.
                         // Let's be conservative: Append if it's short, else new.
                         topics.push(normalize(line));
                     }
                } else {
                    topics.push(normalize(line));
                }
            }
        }
    });

    // Save last
    if (currentSubject) {
        subjects.push({ name: currentSubject, topics: [...topics] });
    }

    // Post-Processing: Split topics by semicolon if they are massive blocks
    // Many editais list: "1. Topic A; Topic B; Topic C."
    subjects.forEach(sub => {
        const expandedTopics = [];
        sub.topics.forEach(t => {
            if (t.length > 200 && t.includes(';')) {
                const parts = t.split(';').map(p => p.trim()).filter(p => p.length > 0);
                // Keep the numbering on the first one, maybe add bullets to others?
                // Or just treat them as subtopics.
                parts.forEach(p => expandedTopics.push(p));
            } else {
                expandedTopics.push(t);
            }
        });
        sub.topics = expandedTopics;
    });

    // Fallback: If no subjects found (weird edital), try to find ANY structure
    if (subjects.length === 0) {
        subjects.push({
            name: "Conteúdo Geral",
            topics: cleanLines.filter(l => topicStartRegex.test(l))
        });
    }

    // Filter garbage subjects (e.g. "PÁGINA 1")
    const cleanSubjects = subjects.filter(s => s.topics.length > 0 && !s.name.match(/Página/i));

    return {
        id: path.basename(fileName, '.pdf').replace(/\s+/g, '-').toLowerCase(),
        nome: path.basename(fileName, '.pdf'),
        concurso: path.basename(fileName, '.pdf'),
        banca: "Desconhecida",
        materias: cleanSubjects.map((s, idx) => ({
            id: `m-${idx}`,
            nome: s.name,
            topics: s.topics // temporary holding
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
            const parsed = advancedHeuristics(text, file);
            results.push(parsed);
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }

    // Flatten structure for the app
    const finalData = results.map(r => {
        const materias = [];
        const itensEdital = [];

        r.materias.forEach((m, mIdx) => {
            const mId = `${r.id}-m-${mIdx}`;
            materias.push({ id: mId, nome: m.nome });

            m.topics.forEach((tName, tIdx) => {
                itensEdital.push({
                    id: `${r.id}-t-${mIdx}-${tIdx}`,
                    nome: tName,
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
