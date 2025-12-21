// Utilitários para gerenciar editais administrativos
import { loadFromLocalStorage, saveToLocalStorage } from './localStorage';
import { globalEditais } from '../data/globalEditais';

const GLOBAL_EDITAIS_KEY = 'global_editais';

export const ensureGlobalEditais = () => {
  const saved = loadFromLocalStorage(GLOBAL_EDITAIS_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) return saved;

  saveToLocalStorage(GLOBAL_EDITAIS_KEY, globalEditais);
  return globalEditais;
};

export const loadGlobalEditais = () => {
  try {
    const saved = loadFromLocalStorage(GLOBAL_EDITAIS_KEY, []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return ensureGlobalEditais();
  } catch (error) {
    console.error('Erro ao carregar editais globais:', error);
    return globalEditais;
  }
};

export const loadAdminEditais = () => {
  try {
    const saved = loadFromLocalStorage('admin_editais', []);
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error('Erro ao carregar editais:', error);
    return [];
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
  const adminEditais = loadAdminEditais();
  const global = loadGlobalEditais();

  return [...global, ...adminEditais].map((edital) => ({
    id: edital.id,
    nome: edital.nome,
    concurso: edital.concurso,
    orgao: edital.orgao,
    banca: edital.banca,
    dataProva: edital.dataProva,
    materias: edital.materias || [],
    itensEdital: edital.itensEdital || [],
    arquivoPdf: edital.arquivoPdf || '',
    source: global.some((item) => item.id === edital.id) ? 'global' : 'admin'
  }));
};

export const getEditalById = (id) => {
  const editais = [...loadGlobalEditais(), ...loadAdminEditais()];
  return editais.find((edital) => edital.id === id);
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
