import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, RefreshCw, Loader2, GitBranch } from 'lucide-react';
import EditalHierarchyProcessor from './components/EditalHierarchyProcessor';
import { saveToLocalStorage } from './utils/localStorage';
import { fetchGlobalEditais, addNewEdital, saveGlobalEditais, deleteConcurso, addMateria, addSubmateria, addSubtopico, deleteMateria, deleteSubmateria, deleteSubtopico, updateMateria, updateSubmateria, updateSubtopico, updateConcurso } from './services/globalEditaisService';

// Página de administração para cadastrar editais globais reutilizáveis
// Esses editais poderão ser selecionados pelos usuários em seus perfis para carregar itens
export default function AdminPage() {
  const [concursos, setConcursos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draftNome, setDraftNome] = useState('');
  const [draftDescricao, setDraftDescricao] = useState('');
  const [hierarquia, setHierarquia] = useState([]); // materias -> submaterias -> subtópicos

  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const loadFromFirestore = async () => {
    setLoading(true);
  const remote = await fetchGlobalEditais();
  setConcursos(remote);
  saveToLocalStorage('globalEditais', remote);
    setLoading(false);
    setSyncMessage(`Carregado ${remote.length} edital(is) do servidor`);
    setTimeout(()=>setSyncMessage(''), 3000);
  };

  useEffect(() => {
    loadFromFirestore();
  }, []);

  const persist = async (list) => {
    setConcursos(list);
    saveToLocalStorage('globalEditais', list);
    await saveGlobalEditais(list);
  };

  const handleCreateConcurso = async () => {
    if (!draftNome.trim() || hierarquia.length === 0) return;
    setLoading(true);
    const novo = { id: Date.now().toString(), nome: draftNome.trim(), descricao: draftDescricao.trim(), materias: hierarquia, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const updated = await addNewEdital(novo);
    setConcursos(updated);
    saveToLocalStorage('globalEditais', updated);
    setSelectedId(novo.id);
    setDraftNome('');
    setDraftDescricao('');
    setHierarquia([]);
    setLoading(false);
    setSyncMessage('Concurso criado');
    setTimeout(()=>setSyncMessage(''), 3000);
  };

  const handleDeleteConcurso = async (id) => {
    if (!confirm('Remover concurso e toda a estrutura?')) return;
    await deleteConcurso(id);
    const updated = await fetchGlobalEditais();
    setConcursos(updated);
    if (selectedId === id) setSelectedId(null);
    setSyncMessage('Concurso removido');
    setTimeout(()=>setSyncMessage(''), 2500);
  };

  const selectedConcurso = concursos.find(c => c.id === selectedId) || null;

  // Handlers Hierarquia existente
  const handleAddMateria = async () => {
    if (!selectedConcurso) return;
    const nome = prompt('Nome da matéria:');
    if (!nome) return;
    const materia = { id: 'm-'+Date.now().toString(36), nome, submaterias: [] };
    const updatedConcurso = await addMateria(selectedConcurso.id, materia);
    setConcursos(prev => prev.map(c => c.id === updatedConcurso.id ? updatedConcurso : c));
  };

  const handleAddSubmateria = async (materiaId) => {
    const nome = prompt('Nome da submatéria:');
    if (!nome) return;
    const sub = { id: 's-'+Date.now().toString(36), nome, subtopicos: [] };
    const updated = await addSubmateria(selectedConcurso.id, materiaId, sub);
    setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddSubtopico = async (materiaId, submateriaId) => {
    const nome = prompt('Nome do subtópico:');
    if (!nome) return;
    const top = { id: 't-'+Date.now().toString(36), nome };
    const updated = await addSubtopico(selectedConcurso.id, materiaId, submateriaId, top);
    setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteMateria = async (materiaId) => {
    if (!confirm('Excluir matéria e todo seu conteúdo?')) return;
    const updated = await deleteMateria(selectedConcurso.id, materiaId);
    setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteSubmateria = async (materiaId, submateriaId) => {
    if (!confirm('Excluir submatéria e seus subtópicos?')) return;
    const updated = await deleteSubmateria(selectedConcurso.id, materiaId, submateriaId);
    setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteSubtopico = async (materiaId, submateriaId, topicoId) => {
    if (!confirm('Excluir subtópico?')) return;
    const updated = await deleteSubtopico(selectedConcurso.id, materiaId, submateriaId, topicoId);
    setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleRename = async (type, ids) => {
    const novoNome = prompt('Novo nome:');
    if (!novoNome) return;
    let updated;
    if (type === 'materia') {
      updated = await updateMateria(selectedConcurso.id, ids.materiaId, { nome: novoNome });
    } else if (type === 'submateria') {
      updated = await updateSubmateria(selectedConcurso.id, ids.materiaId, ids.submateriaId, { nome: novoNome });
    } else if (type === 'subtopico') {
      updated = await updateSubtopico(selectedConcurso.id, ids.materiaId, ids.submateriaId, ids.topicoId, { nome: novoNome });
    }
    if (updated) setConcursos(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleProcessAddMultiple = (names) => {
    const newOnes = names.map(n => ({ id: Date.now().toString() + Math.random().toString(36).slice(2), name: n, createdAt: new Date().toISOString() }));
    setTempItems(prev => [...prev, ...newOnes]);
  };

  const handleAttachItemsToExistingEdital = async () => {
    if (!selectedEdital) return;
    setLoading(true);
    const newItems = tempItems.map(i=>({ ...i, id: i.id || Date.now().toString()+Math.random().toString(36).slice(2) }));
    const updated = await appendItemsToEdital(selectedEdital.id, newItems);
    setGlobalEditais(updated);
    saveToLocalStorage('globalEditais', updated);
    setTempItems([]);
    setLoading(false);
    setSyncMessage('Itens adicionados e sincronizados');
    setTimeout(()=>setSyncMessage(''), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-800" style={{background:'#f8fafc', minHeight:'100vh'}}>
  <h1 className="text-3xl font-bold mb-2 text-slate-900 flex items-center gap-2"><GitBranch className="text-indigo-600"/>Admin - Concursos Globais</h1>
  <p className="text-sm text-slate-600 mb-4">Gerencie concursos hierárquicos (matéria → submatéria → subtópico) disponíveis para importação.</p>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={loadFromFirestore} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded flex items-center gap-1 hover:bg-indigo-700"><RefreshCw size={16}/> Atualizar</button>
  <button onClick={()=>persist(concursos)} className="px-3 py-2 bg-emerald-600 text-white text-sm rounded flex items-center gap-1 hover:bg-emerald-700"><Save size={16}/> Sincronizar</button>
        {loading && <span className="flex items-center text-sm text-slate-500"><Loader2 size={16} className="mr-1 animate-spin"/> Salvando...</span>}
        {syncMessage && <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-700">{syncMessage}</span>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista de editais */}
    <div className="md:col-span-1 border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-3 flex items-center justify-between">Concursos <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{concursos.length}</span></h2>
          <ul className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {concursos.map(c => {
              const totalSubtopicos = (c.materias||[]).reduce((acc,m)=> acc + (m.submaterias||[]).reduce((a,s)=> a + (s.subtopicos||[]).length,0),0);
              return (
                <li key={c.id} className={`p-2 border rounded cursor-pointer flex items-center justify-between transition-colors ${selectedId === c.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-100'}`} onClick={() => setSelectedId(c.id)}>
                  <div className="mr-2">
                    <div className="text-sm font-semibold text-slate-800">{c.nome}</div>
                    <div className="text-xs text-slate-500">{totalSubtopicos} subtópicos</div>
                  </div>
                  <button className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteConcurso(c.id); }} title="Excluir"><Trash2 size={16}/></button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Formulário / Processor */}
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h2 className="font-semibold mb-4 flex items-center text-slate-900"><PlusCircle size={18} className="mr-2 text-indigo-600"/>Novo Concurso</h2>
            <div className="grid gap-4 mb-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide font-semibold text-slate-600">Nome</label>
                <input value={draftNome} onChange={e => setDraftNome(e.target.value)} placeholder="Ex: TJ-2025" className="border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder-slate-400" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs uppercase tracking-wide font-semibold text-slate-600">Descrição</label>
                <textarea value={draftDescricao} onChange={e => setDraftDescricao(e.target.value)} placeholder="Descrição / Observações" className="border px-3 py-2 rounded text-sm h-24 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder-slate-400" />
              </div>
            </div>
            {hierarquia.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-700 font-medium flex items-center justify-between">
                <span>{hierarquia.length} matéria(s) estruturadas prontas.</span>
                <button onClick={()=>setHierarquia([])} className="text-indigo-600 hover:underline">Limpar</button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleCreateConcurso} disabled={!draftNome.trim() || hierarquia.length===0} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"><Save size={16}/> Salvar</button>
              <button onClick={()=>setHierarquia([])} className="px-4 py-2 bg-slate-600 text-white rounded text-sm font-medium hover:bg-slate-700">Reset</button>
            </div>
          </div>

          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h2 className="font-semibold mb-2 flex items-center text-slate-900"><GitBranch size={18} className="mr-2 text-indigo-600"/>Processar Texto Hierárquico</h2>
            <EditalHierarchyProcessor onParsed={(estrut)=> setHierarquia(estrut)} />
          </div>

      {selectedConcurso && selectedConcurso.materias && selectedConcurso.materias.length > 0 && (
            <div className="border rounded-lg p-5 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-900">Estrutura: <span className="text-indigo-700">{selectedConcurso.nome}</span></h2>
                <button onClick={handleAddMateria} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">+ Matéria</button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar text-sm">
        {selectedConcurso.materias.map(m => (
                  <div key={m.id} className="border rounded p-2 bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{m.nome}</span>
                      <div className="flex gap-1">
                        <button onClick={()=>handleRename('materia',{ materiaId: m.id })} className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded">Renomear</button>
                        <button onClick={()=>handleAddSubmateria(m.id)} className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded">+ Sub</button>
                        <button onClick={()=>handleDeleteMateria(m.id)} className="text-xs px-2 py-0.5 bg-red-600 text-white rounded">Del</button>
                      </div>
                    </div>
                    <div className="pl-3 space-y-2">
                      {(m.submaterias||[]).map(s => (
                        <div key={s.id} className="border rounded p-2 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-700 font-medium">{s.nome}</span>
                            <div className="flex gap-1">
                              <button onClick={()=>handleRename('submateria',{ materiaId: m.id, submateriaId: s.id })} className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded">Ren</button>
                              <button onClick={()=>handleAddSubtopico(m.id, s.id)} className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded">+ Top</button>
                              <button onClick={()=>handleDeleteSubmateria(m.id, s.id)} className="text-xs px-2 py-0.5 bg-red-600 text-white rounded">Del</button>
                            </div>
                          </div>
                          <ul className="pl-3 list-disc space-y-1 text-xs">
                            {(s.subtopicos||[]).map(t => (
                              <li key={t.id} className="flex items-center justify-between">
                                <span className="text-slate-600">{t.nome}</span>
                                <div className="flex gap-1">
                                  <button onClick={()=>handleRename('subtopico',{ materiaId: m.id, submateriaId: s.id, topicoId: t.id })} className="text-[10px] px-1 py-0.5 bg-amber-500 text-white rounded">Ren</button>
                                  <button onClick={()=>handleDeleteSubtopico(m.id, s.id, t.id)} className="text-[10px] px-1 py-0.5 bg-red-600 text-white rounded">Del</button>
                                </div>
                              </li>
                            ))}
                            {(s.subtopicos||[]).length === 0 && <li className="text-slate-400 italic">Sem subtópicos</li>}
                          </ul>
                        </div>
                      ))}
                      {(m.submaterias||[]).length === 0 && <div className="text-xs text-slate-400 italic">Sem submatérias</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
