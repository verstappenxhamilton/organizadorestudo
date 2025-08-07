// Utilitários para gerenciar editais administrativos

export const loadAdminEditais = () => {
  try {
    const saved = localStorage.getItem('admin_editais');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Erro ao carregar editais:', error);
    return [];
  }
};

export const saveAdminEditais = (editais) => {
  try {
    localStorage.setItem('admin_editais', JSON.stringify(editais));
    
    // Salvar também como arquivo JSON para simulação de database
    const dataStr = JSON.stringify(editais, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Em uma aplicação real, isso seria uma chamada para API
    console.log('Editais salvos:', editais.length, 'itens');
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar editais:', error);
    return false;
  }
};

export const getAvailableEditais = () => {
  const editais = loadAdminEditais();
  return editais.map(edital => ({
    id: edital.id,
    nome: edital.nome,
    concurso: edital.concurso,
    orgao: edital.orgao,
    banca: edital.banca,
    dataProva: edital.dataProva,
    materias: edital.materias || [],
    itensEdital: edital.itensEdital || []
  }));
};

export const getEditalById = (id) => {
  const editais = loadAdminEditais();
  return editais.find(edital => edital.id === id);
};

export const createProfileFromEdital = (edital, profileName) => {
  if (!edital) return null;
  
  return {
    id: Date.now(),
    name: profileName,
    editalId: edital.id,
    editalNome: edital.nome,
    concurso: edital.concurso,
    orgao: edital.orgao,
    banca: edital.banca,
    dataProva: edital.dataProva,
    createdAt: new Date().toISOString()
  };
};
