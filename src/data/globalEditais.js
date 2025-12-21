
// This file serves as a local database for "Global Editais"
// In a real application, this data would be populated by parsing the PDFs on a backend
// or by a manual data entry process.
// Since we cannot reliably parse PDFs in this environment, we are using the provided example data
// and placeholders for the other files found in the 'editais/' directory.

export const GLOBAL_EDITAIS = [
  {
    id: "enam-1",
    nome: "EDITAL ENAM 1",
    concurso: "Exame Nacional da Magistratura",
    orgao: "ENAM",
    banca: "FGV",
    dataProva: "2024-04-14",
    materias: [
        { id: "enam1-m1", nome: "Direito Constitucional", peso: 1 },
        { id: "enam1-m2", nome: "Direito Administrativo", peso: 1 },
        { id: "enam1-m3", nome: "Noções Gerais de Direito e Formação Humanística", peso: 1 },
        { id: "enam1-m4", nome: "Direitos Humanos", peso: 1 },
        { id: "enam1-m5", nome: "Direito Processual Civil", peso: 1 },
        { id: "enam1-m6", nome: "Direito Civil", peso: 1 },
        { id: "enam1-m7", nome: "Direito Empresarial", peso: 1 },
        { id: "enam1-m8", nome: "Direito Penal", peso: 1 }
    ],
    itensEdital: [
      { id: "enam1-i1", nome: "1. Direito Constitucional. 1.1 Constituição: conceito, classificações, princípios fundamentais." },
      { id: "enam1-i2", nome: "1.2 Direitos e garantias fundamentais." },
      { id: "enam1-i3", nome: "1.3 Organização do Estado." },
      { id: "enam1-i4", nome: "2. Direito Administrativo. 2.1 Administração pública: princípios, organização." },
      { id: "enam1-i5", nome: "2.2 Atos administrativos." },
      { id: "enam1-i6", nome: "3. Humanística. 3.1 Sociologia do Direito." },
      { id: "enam1-i7", nome: "3.2 Psicologia Judiciária." },
      { id: "enam1-i8", nome: "3.3 Ética e Estatuto Jurídico da Magistratura Nacional." }
    ]
  },
  {
    id: "enam-2024-2",
    nome: "EDITAL ENAM 2024.2",
    concurso: "Exame Nacional da Magistratura - 2ª Edição",
    orgao: "ENAM",
    banca: "FGV",
    dataProva: "2024-10-20",
    materias: [
      { id: "enam2-m1", nome: "Direito Constitucional", peso: 1 },
      { id: "enam2-m2", nome: "Direito Administrativo", peso: 1 }
    ],
    itensEdital: [
       { id: "enam2-i1", nome: "1. Direito Constitucional" },
       { id: "enam2-i2", nome: "2. Direito Administrativo" }
    ]
  },
  {
    id: "mpf-2025",
    nome: "EDITAL MPF 2025",
    concurso: "Procurador da República",
    orgao: "MPF",
    banca: "MPF",
    dataProva: "2025-11-02",
    materias: [
       { id: "mpf25-m1", nome: "Grupo I - Constitucional e Metodologia Jurídica", peso: 15 },
       { id: "mpf25-m2", nome: "Grupo II - Administrativo e Ambiental", peso: 15 }
    ],
    itensEdital: [
       { id: "mpf25-i1", nome: "1. Teoria da Constituição" },
       { id: "mpf25-i2", nome: "2. Poder Constituinte" },
       { id: "mpf25-i3", nome: "3. Controle de Constitucionalidade" }
    ]
  },
  {
    id: "trt-15",
    nome: "Edital nº 001/2024 - TRT 15",
    concurso: "Analista Judiciário - TRT 15ª Região",
    orgao: "Tribunal Regional do Trabalho da 15ª Região",
    banca: "FCC",
    dataProva: "2025-05-15",
    materias: [
      { id: "trt15-m1", nome: "Direito Constitucional", peso: 3 },
      { id: "trt15-m2", nome: "Direito Administrativo", peso: 3 },
      { id: "trt15-m3", nome: "Direito do Trabalho", peso: 4 },
      { id: "trt15-m4", nome: "Direito Processual do Trabalho", peso: 4 },
      { id: "trt15-m5", nome: "Português", peso: 2 }
    ],
    itensEdital: [
      { id: "trt15-i1", nome: "1. Direitos e garantias fundamentais" },
      { id: "trt15-i2", nome: "2. Organização do Estado" },
      { id: "trt15-i3", nome: "3. Administração Pública" },
      { id: "trt15-i4", nome: "4. Servidores públicos" },
      { id: "trt15-i5", nome: "5. Contrato individual de trabalho" },
      { id: "trt15-i6", nome: "6. Organização sindical" },
      { id: "trt15-i7", nome: "7. Procedimento ordinário trabalhista" },
      { id: "trt15-i8", nome: "8. Recursos trabalhistas" }
    ]
  },
  {
    id: "trf-3",
    nome: "Edital nº 002/2024 - TRF 3",
    concurso: "Técnico Judiciário - TRF 3ª Região",
    orgao: "Tribunal Regional Federal da 3ª Região",
    banca: "CESPE",
    dataProva: "2025-04-20",
    materias: [
      { id: "trf3-m1", nome: "Direito Constitucional", peso: 2 },
      { id: "trf3-m2", nome: "Direito Administrativo", peso: 2 },
      { id: "trf3-m3", nome: "Português", peso: 3 },
      { id: "trf3-m4", nome: "Informática", peso: 2 },
      { id: "trf3-m5", nome: "Raciocínio Lógico", peso: 1 }
    ],
    itensEdital: [
      { id: "trf3-i1", nome: "1. Princípios constitucionais" },
      { id: "trf3-i2", nome: "2. Direitos sociais" },
      { id: "trf3-i3", nome: "3. Organização administrativa" },
      { id: "trf3-i4", nome: "4. Atos administrativos" },
      { id: "trf3-i5", nome: "5. Licitações e contratos" },
      { id: "trf3-i6", nome: "6. Interpretação de texto" },
      { id: "trf3-i7", nome: "7. Gramática" },
      { id: "trf3-i8", nome: "8. Sistema operacional Windows" },
      { id: "trf3-i9", nome: "9. Microsoft Office" },
      { id: "trf3-i10", nome: "10. Proposições lógicas" }
    ]
  },
  // Placeholders for other files found in the directory
  { id: "enam-2025-1", nome: "EDITAL ENAM 2025.1", concurso: "ENAM 2025.1", itensEdital: [], materias: [] },
  { id: "mpf-2022", nome: "EDITAL MPF 2022", concurso: "MPF 2022", itensEdital: [], materias: [] },
  { id: "mpgo-2023", nome: "EDITAL MPGO 2023", concurso: "MPGO 2023", itensEdital: [], materias: [] },
  { id: "mpmg-2024", nome: "EDITAL MPMG 2024", concurso: "MPMG 2024", itensEdital: [], materias: [] },
  { id: "mpmg-undated", nome: "EDITAL MPMG", concurso: "MPMG", itensEdital: [], materias: [] },
  { id: "mprs-2025", nome: "EDITAL MPRS 2025", concurso: "MPRS 2025", itensEdital: [], materias: [] },
  { id: "tjdft-2022", nome: "EDITAL TJDFT 2022 JUIZ", concurso: "TJDFT 2022", itensEdital: [], materias: [] },
  { id: "tjmg-2021", nome: "EDITAL TJMG 2021", concurso: "TJMG 2021", itensEdital: [], materias: [] },
  { id: "tjsp-2024", nome: "EDITAL TJSP 2024", concurso: "TJSP 2024", itensEdital: [], materias: [] },
  { id: "trf2-2025", nome: "EDITAL TRF2 2025", concurso: "TRF2 2025", itensEdital: [], materias: [] },
  { id: "trf5-2025", nome: "TRF5 EDITAL 2025", concurso: "TRF5 2025", itensEdital: [], materias: [] },
];
