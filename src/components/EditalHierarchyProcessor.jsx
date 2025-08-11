import React, { useState } from 'react';
import { Layers, ListTree, ChevronDown, ChevronRight } from 'lucide-react';

// Converte texto numerado em hierarquia: Matéria (1.), Submatéria (1.1), Subtópico (1.1.1+)
export function parseHierarchicalEdital(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const materias = [];
  let currentMateria = null;
  let currentSub = null;

  lines.forEach(line => {
    const m = line.match(/^(\d+(?:\.\d+)*)\.?\s+(.*)$/);
    if (!m) return; // ignora linhas não numeradas
    const path = m[1];
    const name = m[2].trim();
    const depth = path.split('.').length;

    if (depth === 1) {
      currentMateria = {
        id: Date.now().toString()+Math.random().toString(36).slice(2),
        nome: `${path}. ${name}`,
        submaterias: []
      };
      materias.push(currentMateria);
      currentSub = null;
    } else if (depth === 2) {
      if (!currentMateria) {
        currentMateria = {
          id: Date.now().toString()+Math.random().toString(36).slice(2),
          nome: 'Sem Matéria '+path.split('.')[0],
          submaterias: []
        };
        materias.push(currentMateria);
      }
      currentSub = {
        id: Date.now().toString()+Math.random().toString(36).slice(2),
        nome: `${path}. ${name}`,
        subtopicos: []
      };
      currentMateria.submaterias.push(currentSub);
    } else { // 3+ profundidade
      if (!currentMateria) return;
      if (!currentSub) {
        currentSub = {
          id: Date.now().toString()+Math.random().toString(36).slice(2),
          nome: 'Submatéria desconhecida',
          subtopicos: []
        };
        currentMateria.submaterias.push(currentSub);
      }
      currentSub.subtopicos.push({
        id: Date.now().toString()+Math.random().toString(36).slice(2),
        nome: `${path}. ${name}`
      });
    }
  });

  return materias;
}

export default function EditalHierarchyProcessor({ onParsed }) {
  const [rawText, setRawText] = useState('');
  const [materias, setMaterias] = useState([]);
  const [expanded, setExpanded] = useState({});

  const handleProcess = () => {
    const parsed = parseHierarchicalEdital(rawText);
    setMaterias(parsed);
    onParsed && onParsed(parsed);
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wide font-semibold text-slate-600 mb-1">Texto do Edital (numerado)</label>
        <textarea
          value={rawText}
          onChange={e=>setRawText(e.target.value)}
          placeholder={'Exemplo:\n1. Língua Portuguesa\n1.1 Gramática\n1.1.1 Classes de palavras\n1.1.2 Sintaxe\n2. Matemática\n2.1 Álgebra\n2.1.1 Equações'}
          className="w-full h-40 border rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder-slate-400"
        />
        <button onClick={handleProcess} disabled={!rawText.trim()} className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"><Layers size={16}/> Processar Hierarquia</button>
      </div>
      {materias.length > 0 && (
        <div className="border rounded-lg p-3 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center"><ListTree size={16} className="mr-1 text-indigo-600"/>Pré-visualização ({materias.length} matérias)</h3>
          <ul className="space-y-1 text-sm">
            {materias.map(mat => (
              <li key={mat.id} className="">
                <div className="flex items-start">
                  <button type="button" onClick={()=>toggle(mat.id)} className="mr-1 text-slate-600 hover:text-slate-800 mt-0.5">{expanded[mat.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}</button>
                  <span className="font-medium text-slate-800">{mat.nome}</span>
                </div>
                {expanded[mat.id] && mat.submaterias.length>0 && (
                  <ul className="ml-5 mt-1 space-y-1 border-l pl-3 border-slate-300">
                    {mat.submaterias.map(sub => (
                      <li key={sub.id}>
                        <div className="flex items-start">
                          <button type="button" onClick={()=>toggle(sub.id)} className="mr-1 text-slate-500 hover:text-slate-700 mt-0.5">{expanded[sub.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
                          <span className="text-slate-700">{sub.nome}</span>
                        </div>
                        {expanded[sub.id] && sub.subtopicos.length>0 && (
                          <ul className="ml-5 mt-1 space-y-0.5 list-disc marker:text-indigo-500">
                            {sub.subtopicos.map(top => (
                              <li key={top.id} className="text-slate-600">{top.nome}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
