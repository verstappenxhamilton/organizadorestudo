import * as pdfjsLib from 'pdfjs-dist';

// Configure worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const parsePdfFrontend = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
    }

    return advancedHeuristics(fullText, file.name);
};

// Copy of the logic from parse_editais_manual.cjs adapted for frontend
function advancedHeuristics(text, fileName) {
    // Basic normalization
    const normalize = (t) => t.replace(/\s+/g, ' ').trim();

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleanLines = lines.filter(l => !/^\d+\s*of\s*\d+$/i.test(l) && !/^Página\s+\d+/i.test(l));

    const subjects = [];
    let currentSubject = null;
    let topics = [];

    // Regex patterns
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
            if (topicStartRegex.test(line)) {
                topics.push(normalize(line));
            } else {
                if (topics.length > 0) {
                    const lastTopic = topics[topics.length - 1];
                    // Append if previous didn't end with '.' or ';' or if current line starts lowercase
                    if (!lastTopic.endsWith('.') && !lastTopic.endsWith(';')) {
                         topics[topics.length - 1] += " " + normalize(line);
                    } else {
                         topics.push(normalize(line));
                    }
                } else {
                    topics.push(normalize(line));
                }
            }
        }
    });

    if (currentSubject) {
        subjects.push({ name: currentSubject, topics: [...topics] });
    }

    // Split massive blocks by semicolon
    subjects.forEach(sub => {
        const expandedTopics = [];
        sub.topics.forEach(t => {
            if (t.length > 200 && t.includes(';')) {
                const parts = t.split(';').map(p => p.trim()).filter(p => p.length > 0);
                parts.forEach(p => expandedTopics.push(p));
            } else {
                expandedTopics.push(t);
            }
        });
        sub.topics = expandedTopics;
    });

    // Fallback
    if (subjects.length === 0) {
        subjects.push({
            name: "Conteúdo Geral",
            topics: cleanLines.filter(l => topicStartRegex.test(l))
        });
    }

    // Structure for App
    const id = fileName.replace(/\.pdf$/i, '').replace(/\s+/g, '-').toLowerCase();

    // Create flattened structure
    const materias = [];
    const itensEdital = [];

    subjects.forEach((s, mIdx) => {
        const mId = `${id}-m-${mIdx}`;
        materias.push({ id: mId, nome: s.name });

        s.topics.forEach((tName, tIdx) => {
            itensEdital.push({
                id: `${id}-t-${mIdx}-${tIdx}`,
                nome: tName,
                materiaId: mId
            });
        });
    });

    return {
        id,
        nome: fileName.replace(/\.pdf$/i, ''),
        concurso: fileName.replace(/\.pdf$/i, ''),
        banca: "Desconhecida",
        materias,
        itensEdital
    };
}
