// Utilitários para gerenciar editais administrativos
import { loadFromLocalStorage, saveToLocalStorage } from './localStorage';
import { globalEditaisSeed } from '../data/globalEditais';

export const loadAdminEditais = () => {
  try {
    const saved = loadFromLocalStorage('admin_editais', []);
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error('Erro ao carregar editais:', error);
    return [];
  }
};

export const seedGlobalEditais = () => {
  try {
    const existing = loadAdminEditais();
    const existingIds = new Set(existing.map((edital) => edital.id));
    const missingGlobals = globalEditaisSeed.filter((edital) => !existingIds.has(edital.id));

    if (missingGlobals.length === 0) return false;

    saveToLocalStorage('admin_editais', [...existing, ...missingGlobals]);
    return true;
  } catch (error) {
    console.error('Erro ao carregar editais globais:', error);
    return false;
  }
};

export const saveAdminEditais = (editais) => {
  try {
    saveToLocalStorage('admin_editais', editais);
    
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
    itensEdital: edital.itensEdital || [],
    isGlobal: Boolean(edital.isGlobal)
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
