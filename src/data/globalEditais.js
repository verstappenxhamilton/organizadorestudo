const now = new Date().toISOString();

const createPdfEdital = (filename) => {
  const displayName = filename.replace(/\.pdf$/i, '').trim();
  const concurso = displayName.replace(/^EDITAL\s*/i, '').trim();
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    id: `global-${slug}`,
    nome: displayName,
    concurso: concurso || displayName,
    orgao: '',
    banca: '',
    dataProva: '',
    inscricoesAte: '',
    materias: [],
    itensEdital: [],
    arquivo: filename,
    isGlobal: true,
    dataAtualização: now
  };
};

const pdfEditais = [
  'EDITAL ENAM 1.pdf',
  'EDITAL ENAM 2024.2.pdf',
  'EDITAL ENAM 2025.1.pdf',
  'EDITAL MPF 2022.pdf',
  'EDITAL MPF 2025.pdf',
  'EDITAL MPGO 2023.pdf',
  'EDITAL MPMG 2024.pdf',
  'EDITAL MPMG.pdf',
  'EDITAL MPRS 2025.pdf',
  'EDITAL TJDFT 2022 JUIZ.pdf',
  'EDITAL TJMG 2021.pdf',
  'EDITAL TJSP 2024.pdf',
  'EDITAL TRF2 2025 .pdf',
  'TRF5 EDITAL 2025.pdf'
].map(createPdfEdital);

const exampleEditais = [
  {
    id: 'exemplo-trt15-2024',
    nome: 'Edital nº 001/2024',
    concurso: 'Analista Judiciário - TRT 15ª Região',
    orgao: 'Tribunal Regional do Trabalho da 15ª Região',
    banca: 'FCC',
    dataProva: '2025-05-15',
    inscricoesAte: '2025-03-15',
    materias: [
      {
        id: 'exemplo-trt15-2024-materia-1',
        nome: 'Direito Constitucional',
        peso: 3
      },
      {
        id: 'exemplo-trt15-2024-materia-2',
        nome: 'Direito Administrativo',
        peso: 3
      },
      {
        id: 'exemplo-trt15-2024-materia-3',
        nome: 'Direito do Trabalho',
        peso: 4
      },
      {
        id: 'exemplo-trt15-2024-materia-4',
        nome: 'Direito Processual do Trabalho',
        peso: 4
      },
      {
        id: 'exemplo-trt15-2024-materia-5',
        nome: 'Português',
        peso: 2
      }
    ],
    itensEdital: [
      {
        id: 'exemplo-trt15-2024-item-1',
        nome: '1. Direitos e garantias fundamentais'
      },
      {
        id: 'exemplo-trt15-2024-item-2',
        nome: '2. Organização do Estado'
      },
      {
        id: 'exemplo-trt15-2024-item-3',
        nome: '3. Administração Pública'
      },
      {
        id: 'exemplo-trt15-2024-item-4',
        nome: '4. Servidores públicos'
      },
      {
        id: 'exemplo-trt15-2024-item-5',
        nome: '5. Contrato individual de trabalho'
      },
      {
        id: 'exemplo-trt15-2024-item-6',
        nome: '6. Organização sindical'
      },
      {
        id: 'exemplo-trt15-2024-item-7',
        nome: '7. Procedimento ordinário trabalhista'
      },
      {
        id: 'exemplo-trt15-2024-item-8',
        nome: '8. Recursos trabalhistas'
      }
    ],
    isGlobal: true,
    dataAtualização: '2024-12-17T21:00:00.000Z'
  },
  {
    id: 'exemplo-trf3-2024',
    nome: 'Edital nº 002/2024',
    concurso: 'Técnico Judiciário - TRF 3ª Região',
    orgao: 'Tribunal Regional Federal da 3ª Região',
    banca: 'CESPE',
    dataProva: '2025-04-20',
    inscricoesAte: '2025-02-20',
    materias: [
      {
        id: 'exemplo-trf3-2024-materia-1',
        nome: 'Direito Constitucional',
        peso: 2
      },
      {
        id: 'exemplo-trf3-2024-materia-2',
        nome: 'Direito Administrativo',
        peso: 2
      },
      {
        id: 'exemplo-trf3-2024-materia-3',
        nome: 'Português',
        peso: 3
      },
      {
        id: 'exemplo-trf3-2024-materia-4',
        nome: 'Informática',
        peso: 2
      },
      {
        id: 'exemplo-trf3-2024-materia-5',
        nome: 'Raciocínio Lógico',
        peso: 1
      }
    ],
    itensEdital: [
      {
        id: 'exemplo-trf3-2024-item-1',
        nome: '1. Princípios constitucionais'
      },
      {
        id: 'exemplo-trf3-2024-item-2',
        nome: '2. Direitos sociais'
      },
      {
        id: 'exemplo-trf3-2024-item-3',
        nome: '3. Organização administrativa'
      },
      {
        id: 'exemplo-trf3-2024-item-4',
        nome: '4. Atos administrativos'
      },
      {
        id: 'exemplo-trf3-2024-item-5',
        nome: '5. Licitações e contratos'
      },
      {
        id: 'exemplo-trf3-2024-item-6',
        nome: '6. Interpretação de texto'
      },
      {
        id: 'exemplo-trf3-2024-item-7',
        nome: '7. Gramática'
      },
      {
        id: 'exemplo-trf3-2024-item-8',
        nome: '8. Sistema operacional Windows'
      },
      {
        id: 'exemplo-trf3-2024-item-9',
        nome: '9. Microsoft Office'
      },
      {
        id: 'exemplo-trf3-2024-item-10',
        nome: '10. Proposições lógicas'
      }
    ],
    isGlobal: true,
    dataAtualização: '2024-12-17T21:10:00.000Z'
  }
];

export const globalEditaisSeed = [...pdfEditais, ...exampleEditais];
