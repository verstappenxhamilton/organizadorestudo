import React, { useState, useMemo } from 'react';
import { compareConcursos } from '../services/globalEditaisService';
import { GitCompare } from 'lucide-react';

export default function ContestComparison({ concursos }) {
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
  const [scope, setScope] = useState('materias');

  const concursoA = useMemo(()=>concursos.find(c=>c.id===aId), [aId, concursos]);
  const concursoB = useMemo(()=>concursos.find(c=>c.id===bId), [bId, concursos]);

  const result = useMemo(()=> {
    if (!concursoA || !concursoB) return null;
    return compareConcursos(concursoA, concursoB);
  }, [concursoA, concursoB]);

  const renderList = (title, items, color) => (
    <div className="flex-1 min-w-[200px] border rounded p-3 bg-white shadow-sm">
      <h4 className="text-xs uppercase font-semibold text-slate-500 mb-2">{title}</h4>
      {items.length === 0 ? (
        <div className="text-xs text-slate-400">Nada</div>
      ) : (
        <ul className="space-y-1 max-h-56 overflow-y-auto text-xs leading-snug">
          {items.map((i,idx)=>(<li key={idx} className={`px-2 py-1 rounded bg-${color}-50 text-${color}-700 border border-${color}-100`}>{i}</li>))}
        </ul>
      )}
    </div>
  );

  const currentScope = result ? result[scope] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitCompare size={20} className="text-indigo-600"/>
        <h3 className="font-semibold text-slate-800">Comparar Concursos</h3>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Concurso A</label>
          <select value={aId} onChange={e=>setAId(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Selecione</option>
            {concursos.map(c=> <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Concurso B</label>
          <select value={bId} onChange={e=>setBId(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Selecione</option>
            {concursos.map(c=> <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Escopo</label>
          <select value={scope} onChange={e=>setScope(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="materias">Matérias</option>
            <option value="submaterias">Submatérias</option>
            <option value="subtopicos">Subtópicos</option>
          </select>
        </div>
      </div>
      {result && (
        <div className="flex flex-wrap gap-4">
          {renderList('Comuns', currentScope.comuns, 'emerald')}
          {renderList('Exclusivas A', currentScope.aExclusivas, 'indigo')}
          {renderList('Exclusivas B', currentScope.bExclusivas, 'rose')}
        </div>
      )}
      {!result && <p className="text-xs text-slate-500">Selecione dois concursos para comparar.</p>}
    </div>
  );
}
