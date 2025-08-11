import React, { useEffect, useState } from 'react';
import { saveToLocalStorage } from '../../utils/localStorage';

export default function ImportConcursoModal({ concursos, concursoId, subjects, setSubjects, syllabusItems, setSyllabusItems, onClose, showToast, activeProfileId }) {
  const [mapping, setMapping] = useState({});
  const [autoCreateSubjects, setAutoCreateSubjects] = useState(true);
  const [importSubtopicos, setImportSubtopicos] = useState(true);
  const [prefixSubtopico, setPrefixSubtopico] = useState('');
  const concurso = concursos.find(c=>c.id===concursoId);

  useEffect(()=>{
    if (concurso) {
      const initial = {};
      (concurso.materias||[]).forEach(m=>{
        const match = subjects.find(s=> s.name.toLowerCase() === m.nome.toLowerCase());
        if (match) initial[m.id] = match.id;
      });
      setMapping(initial);
    }
  },[concurso, subjects]);

  if (!concurso) return <div className="p-4">Concurso não encontrado</div>;

  const handleChangeMap = (materiaId, subjectId) => setMapping(prev=>({...prev, [materiaId]: subjectId}));

  const ensureSubject = (materia) => {
    if (mapping[materia.id]) return mapping[materia.id];
    if (!autoCreateSubjects) return null;
    const newSubject = { id:'subj-'+Date.now().toString(36)+Math.random().toString(36).slice(2), profileId: activeProfileId, name: materia.nome, color:'#6366f1', weight:1, createdAt: new Date().toISOString() };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    saveToLocalStorage('subjects', updated);
    setMapping(prev=>({...prev, [materia.id]: newSubject.id }));
    return newSubject.id;
  };

  const alreadyImported = new Set(syllabusItems.filter(i=> i.concursoId===concurso.id).map(i=> i.subtopicoKey));

  const handleImport = () => {
    const newItems = [];
    (concurso.materias||[]).forEach(m=>{
      const subjectId = ensureSubject(m) || mapping[m.id];
      if (!subjectId) return;
      (m.submaterias||[]).forEach(s=>{
        (s.subtopicos||[]).forEach(t=>{
          if (!importSubtopicos) return;
          const key = `${m.nome.toLowerCase()}::${s.nome.toLowerCase()}::${t.nome.toLowerCase()}`;
          if (alreadyImported.has(key)) return;
          newItems.push({
            id:'itm-'+Date.now().toString(36)+Math.random().toString(36).slice(2),
            subjectId,
            name: `${prefixSubtopico? prefixSubtopico+' ':''}${s.nome} - ${t.nome}`,
            isStudied:false,
            createdAt: new Date().toISOString(),
            concursoId: concurso.id,
            materiaId: m.id,
            submateriaId: s.id,
            subtopicoId: t.id,
            subtopicoKey: key
          });
        });
      });
    });
    if (newItems.length === 0) { showToast('Nada novo para importar', 'info'); return; }
    const updatedItems = [...syllabusItems, ...newItems];
    setSyllabusItems(updatedItems);
    saveToLocalStorage('syllabusItems', updatedItems);
    showToast(`${newItems.length} subtópico(s) importados`, 'success');
    onClose();
  };

  const totalSubtopicos = (concurso.materias||[]).reduce((acc,m)=> acc + (m.submaterias||[]).reduce((a,s)=> a + (s.subtopicos||[]).length,0),0);
  const importedCount = syllabusItems.filter(i=> i.concursoId===concurso.id).length;

  return (
    <div className="p-4 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-800">{concurso.nome}</div>
          <div className="text-xs text-slate-500">{totalSubtopicos} subtópicos • {importedCount} importados</div>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {(concurso.materias||[]).map(m=>{
          const subCount = (m.submaterias||[]).reduce((acc,s)=> acc + (s.subtopicos||[]).length,0);
          return (
            <div key={m.id} className="border rounded p-2 bg-slate-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">{m.nome}</span>
                <select className="text-xs border rounded px-2 py-1" value={mapping[m.id]||''} onChange={e=>handleChangeMap(m.id, e.target.value)}>
                  <option value="">Matéria...</option>
                  {subjects.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="text-[11px] text-slate-500 mb-1">{subCount} subtópicos</div>
              {(m.submaterias||[]).slice(0,3).map(s=> <div key={s.id} className="text-[11px] text-slate-600 truncate">• {s.nome} ({(s.subtopicos||[]).length})</div>)}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={importSubtopicos} onChange={e=>setImportSubtopicos(e.target.checked)} />
        <span>Importar subtópicos</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={autoCreateSubjects} onChange={e=>setAutoCreateSubjects(e.target.checked)} />
        <span>Criar matérias automaticamente</span>
      </div>
      <div>
        <input type="text" placeholder="Prefixo opcional" value={prefixSubtopico} onChange={e=>setPrefixSubtopico(e.target.value)} className="w-full border rounded px-2 py-1 text-xs" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleImport}>Importar</button>
      </div>
    </div>
  );
}
