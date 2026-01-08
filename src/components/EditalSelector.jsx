import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, AlertCircle } from 'lucide-react';
import parsedEditais from '../data/parsedEditais.json';

export const EditalSelector = ({ onSelect, onCancel, currentComparisonId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEditais = parsedEditais.filter(edital => {
    const matchesSearch = edital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          edital.banca?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter out if already selected as comparison (though currently we support only 1 comparison)
    if (edital.id === currentComparisonId) return false;

    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-enter">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-sky-500" size={24} />
              Comparar com Edital
            </h2>
            <p className="text-slate-400 text-sm mt-1">Selecione um edital para visualizar diferenças.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, banca ou ano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-600"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredEditais.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Nenhum edital encontrado.</p>
            </div>
          ) : (
            filteredEditais.map(edital => (
              <div
                key={edital.id}
                onClick={() => onSelect(edital.id)}
                className="group flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div>
                  <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors">
                    {edital.nome}
                  </h3>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span>{edital.banca}</span>
                    <span>•</span>
                    <span>{edital.concurso}</span>
                  </div>
                </div>
                <button
                    className="px-3 py-1 bg-slate-900 rounded-full text-xs font-medium text-slate-400 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(edital.id);
                    }}
                >
                   Selecionar
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-xs text-slate-500 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>Os tópicos serão mesclados visualmente com base no conteúdo.</span>
        </div>
      </div>
    </div>
  );
};
