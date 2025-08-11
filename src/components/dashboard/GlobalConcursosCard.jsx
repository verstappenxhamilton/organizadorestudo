import React from 'react';

export default function GlobalConcursosCard({ concursos, syllabusItems, onImport }) {
  if (!concursos || concursos.length === 0) return null;
  return (
    <div className="card">
      <h2>Concursos Globais</h2>
      <div className="space-y-3">
        {concursos.map(c => {
          const totalSubtopicos = (c.materias||[]).reduce((acc,m)=> acc + (m.submaterias||[]).reduce((a,s)=> a + (s.subtopicos||[]).length,0),0);
          const importedCount = syllabusItems.filter(i=> i.concursoId===c.id).length;
          const pct = totalSubtopicos>0? ((importedCount/totalSubtopicos)*100).toFixed(1):'0';
          return (
            <div key={c.id} className="p-3 border rounded bg-white shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm text-slate-800">{c.nome}</div>
                <button className="btn btn-secondary !py-1 !px-2 text-xs" onClick={()=>onImport(c.id)}>Importar</button>
              </div>
              <div className="text-[11px] text-slate-500 mb-1">{importedCount}/{totalSubtopicos} subtópicos ({pct}%)</div>
              <div className="w-full h-2 bg-slate-200 rounded">
                <div className="h-2 bg-indigo-600 rounded" style={{width: pct+'%'}}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
