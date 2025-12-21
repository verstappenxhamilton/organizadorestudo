import React, { useState } from 'react';
import { useStudyData } from '../hooks/useStudyData';
import { GLOBAL_EDITAIS } from '../data/globalEditais';
import { BookOpen, Check, Plus, Search, Calendar, FileText } from 'lucide-react';
import { useStudyContext } from '../context/StudyContext';

const EditalLibrary = () => {
  const {
    selectedGlobalEditalIds,
    toggleGlobalEditalSelection
  } = useStudyContext();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredEditais = GLOBAL_EDITAIS.filter(edital =>
    edital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.concurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.banca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="text-sky-500" />
            Biblioteca de Editais
          </h1>
          <p className="text-slate-400 mt-1">
            Selecione editais para acompanhar e mesclar seus estudos.
          </p>
        </div>

        <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
                type="text"
                placeholder="Buscar edital, banca ou concurso..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEditais.map(edital => {
            const isSelected = selectedGlobalEditalIds?.includes(edital.id);
            const hasContent = edital.itensEdital && edital.itensEdital.length > 0;

            return (
                <div
                    key={edital.id}
                    className={`
                        relative flex flex-col bg-slate-800 rounded-xl border transition-all duration-200
                        ${isSelected ? 'border-sky-500 shadow-lg shadow-sky-900/20' : 'border-slate-700 hover:border-slate-600 hover:shadow-md'}
                    `}
                >
                    <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                {edital.banca || "Banca N/A"}
                            </span>
                            {isSelected && (
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-sky-500 text-white shadow-sm">
                                    <Check size={14} strokeWidth={3} />
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-100 mb-1 line-clamp-2" title={edital.nome}>
                            {edital.nome}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-1">{edital.concurso}</p>

                        <div className="space-y-2 text-sm text-slate-500">
                             <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>Prova: <span className="text-slate-300">{formatDate(edital.dataProva)}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                <span>Itens: <span className="text-slate-300">{edital.itensEdital?.length || 0}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 rounded-b-xl">
                        <button
                            onClick={() => toggleGlobalEditalSelection(edital.id)}
                            disabled={!hasContent}
                            className={`
                                w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                                ${!hasContent
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                                }
                            `}
                        >
                            {!hasContent ? (
                                "Indisponível (Vazio)"
                            ) : isSelected ? (
                                <>Remover Seleção</>
                            ) : (
                                <><Plus size={16} /> Selecionar Edital</>
                            )}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {filteredEditais.length === 0 && (
          <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-slate-600 mb-4">
                  <Search size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-300">Nenhum edital encontrado</h3>
              <p className="text-slate-500 mt-1">Tente buscar por outros termos.</p>
          </div>
      )}
    </div>
  );
};

export default EditalLibrary;
