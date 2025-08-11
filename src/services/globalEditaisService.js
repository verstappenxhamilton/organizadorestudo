import { db } from '../config/firebase';
import { collection, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Documento único: collection 'config', doc 'globalEditais' // documento único
const CONFIG_COLLECTION = 'config';
const GLOBAL_EDITAIS_DOC = 'globalEditais';

// Normalização de estruturas antigas (legacy) para novo formato concursos
function normalizeToConcursos(rawList) {
  return (rawList || []).map(e => {
    if (e.materias) return e; // já estruturado
    if (e.hierarquia) {
      return {
        id: e.id,
        nome: e.nome || e.nomeConcurso || 'Concurso',
        descricao: e.descricao || '',
        materias: e.hierarquia.map(m => ({
          id: m.id,
            nome: m.nome,
            submaterias: (m.submaterias || []).map(s => ({
              id: s.id,
              nome: s.nome,
              subtopicos: (s.subtopicos || []).map(t => ({ id: t.id, nome: t.nome }))
            }))
        })),
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || e.createdAt || new Date().toISOString()
      };
    }
    if (e.itens && e.itens.length > 0) {
      return {
        id: e.id,
        nome: e.nome || 'Concurso',
        descricao: e.descricao || '',
        materias: [
          {
            id: 'geral-' + e.id,
            nome: 'Geral',
            submaterias: [
              {
                id: 'geral-sub-' + e.id,
                nome: 'Conteúdo',
                subtopicos: e.itens.map(it => ({ id: it.id || (Date.now().toString()+Math.random().toString(36).slice(2)), nome: it.name || it.nome || it }))
              }
            ]
          }
        ],
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || e.createdAt || new Date().toISOString()
      };
    }
    return {
      id: e.id || Date.now().toString()+Math.random().toString(36).slice(2),
      nome: e.nome || 'Concurso',
      descricao: e.descricao || '',
      materias: [],
      createdAt: e.createdAt || new Date().toISOString(),
      updatedAt: e.updatedAt || e.createdAt || new Date().toISOString()
    };
  });
}

export async function fetchGlobalEditais() {
  try {
    const ref = doc(collection(db, CONFIG_COLLECTION), GLOBAL_EDITAIS_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const data = snap.data();
    if (data.concursos) return data.concursos; // já no novo formato
    const legacy = data.editais || [];
    return normalizeToConcursos(legacy);
  } catch (e) {
    console.error('Erro ao buscar editais globais', e);
    return [];
  }
}

export async function saveGlobalEditais(concursos) {
  try {
    const ref = doc(collection(db, CONFIG_COLLECTION), GLOBAL_EDITAIS_DOC);
    await setDoc(ref, { concursos, updatedAt: Timestamp.now() }, { merge: true });
    return true;
  } catch (e) {
    console.error('Erro ao salvar concursos globais', e);
    return false;
  }
}

export async function appendItemsToEdital(editalId, items) {
  try {
    const current = await fetchGlobalEditais();
    const updated = current.map(e => {
      if (e.id === editalId) {
        // Se concurso possui materias estruturadas não mescla itens flat
        if (e.materias) return e; // ignore para hierarquia (append via funções específicas futuramente)
        return { ...e, itens: [...(e.itens||[]), ...items] };
      }
      return e;
    });
    await saveGlobalEditais(updated);
    return updated;
  } catch (e) {
    console.error('Erro ao anexar itens', e);
    throw e;
  }
}

export async function addNewEdital(novo) {
  const current = await fetchGlobalEditais();
  const updated = [...current, { ...novo, createdAt: novo.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }];
  await saveGlobalEditais(updated);
  return updated;
}

export async function updateConcurso(concursoId, patch) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => c.id === concursoId ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c);
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

// Adiciona matéria a um concurso hierárquico
export async function addMateria(concursoId, materia) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => c.id === concursoId ? { ...c, materias: [...(c.materias||[]), materia], updatedAt: new Date().toISOString() } : c);
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function updateMateria(concursoId, materiaId, patch) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => m.id === materiaId ? { ...m, ...patch } : m),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function addSubmateria(concursoId, materiaId, sub) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => m.id === materiaId ? { ...m, submaterias: [...(m.submaterias||[]), sub] } : m),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function addSubtopico(concursoId, materiaId, submateriaId, topico) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => {
        if (m.id !== materiaId) return m;
        return {
          ...m,
          submaterias: m.submaterias.map(s => s.id === submateriaId ? { ...s, subtopicos: [...(s.subtopicos||[]), topico] } : s)
        };
      }),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function updateSubmateria(concursoId, materiaId, submateriaId, patch) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => {
        if (m.id !== materiaId) return m;
        return {
          ...m,
          submaterias: m.submaterias.map(s => s.id === submateriaId ? { ...s, ...patch } : s)
        };
      }),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function updateSubtopico(concursoId, materiaId, submateriaId, topicoId, patch) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => {
        if (m.id !== materiaId) return m;
        return {
          ...m,
          submaterias: m.submaterias.map(s => {
            if (s.id !== submateriaId) return s;
            return {
              ...s,
              subtopicos: s.subtopicos.map(t => t.id === topicoId ? { ...t, ...patch } : t)
            };
          })
        };
      }),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function deleteConcurso(concursoId) {
  const current = await fetchGlobalEditais();
  const updated = current.filter(c => c.id !== concursoId);
  await saveGlobalEditais(updated);
  return true;
}

export async function deleteMateria(concursoId, materiaId) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => c.id === concursoId ? { ...c, materias: c.materias.filter(m => m.id !== materiaId), updatedAt: new Date().toISOString() } : c);
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function deleteSubmateria(concursoId, materiaId, submateriaId) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => m.id === materiaId ? { ...m, submaterias: m.submaterias.filter(s => s.id !== submateriaId) } : m),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export async function deleteSubtopico(concursoId, materiaId, submateriaId, topicoId) {
  const current = await fetchGlobalEditais();
  const updated = current.map(c => {
    if (c.id !== concursoId) return c;
    return {
      ...c,
      materias: c.materias.map(m => {
        if (m.id !== materiaId) return m;
        return {
          ...m,
          submaterias: m.submaterias.map(s => s.id === submateriaId ? { ...s, subtopicos: s.subtopicos.filter(t => t.id !== topicoId) } : s)
        };
      }),
      updatedAt: new Date().toISOString()
    };
  });
  await saveGlobalEditais(updated);
  return updated.find(c=>c.id===concursoId);
}

export function flattenConcurso(concurso) {
  const materias = [];
  const submaterias = [];
  const subtopicos = [];
  (concurso.materias||[]).forEach(m => {
    materias.push(m.nome.toLowerCase());
    (m.submaterias||[]).forEach(s => {
      submaterias.push(`${m.nome.toLowerCase()}::${s.nome.toLowerCase()}`);
      (s.subtopicos||[]).forEach(t => {
        subtopicos.push(`${m.nome.toLowerCase()}::${s.nome.toLowerCase()}::${t.nome.toLowerCase()}`);
      });
    });
  });
  return { materias, submaterias, subtopicos };
}

export function compareConcursos(a, b) {
  const fa = flattenConcurso(a);
  const fb = flattenConcurso(b);
  function intersect(arr1, arr2) { const s2 = new Set(arr2); return arr1.filter(x=>s2.has(x)); }
  function diff(arr1, arr2) { const s2 = new Set(arr2); return arr1.filter(x=>!s2.has(x)); }
  return {
    materias: { comuns: intersect(fa.materias, fb.materias), aExclusivas: diff(fa.materias, fb.materias), bExclusivas: diff(fb.materias, fa.materias) },
    submaterias: { comuns: intersect(fa.submaterias, fb.submaterias), aExclusivas: diff(fa.submaterias, fb.submaterias), bExclusivas: diff(fb.submaterias, fa.submaterias) },
    subtopicos: { comuns: intersect(fa.subtopicos, fb.subtopicos), aExclusivas: diff(fa.subtopicos, fb.subtopicos), bExclusivas: diff(fb.subtopicos, fa.subtopicos) }
  };
}
