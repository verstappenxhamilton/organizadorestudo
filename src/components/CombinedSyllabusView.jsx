
import React, { useMemo } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { mergeSyllabi } from '../utils/syllabusMerger';
import { GLOBAL_EDITAIS } from '../data/globalEditais';
import { ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import { saveToLocalStorage } from '../utils/localStorage';

const MergedSubjectCard = ({ subject, topics, onToggleTopic }) => {
    return (
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden mb-4">
            <div className="p-4 flex justify-between items-center bg-slate-900/40 cursor-default">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">{subject.name}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                        {topics.length} tópicos • {subject.editalIds.length} editais
                    </div>
                </div>
                {/* Always expanded for now, but keeping icon for visual consistency */}
                <ChevronUp className="text-slate-400" />
            </div>

            <div className="bg-slate-900/50 p-4 space-y-2">
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => onToggleTopic(topic)}
                    >
                        <div className="mt-1">
                            {topic.isStudied ? (
                                <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 transition-all duration-200">
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="w-5 h-5 rounded border border-slate-600 hover:border-sky-500 transition-colors"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className={`text-sm mb-1 ${topic.isStudied ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                {topic.nome}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {topic.isUnique && (
                                    <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/20">Único</span>
                                )}
                                {topic.editalIds.map(eid => {
                                    const edital = GLOBAL_EDITAIS.find(e => e.id === eid);
                                    return (
                                        <span key={eid} className="text-[0.65rem] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/20" title={edital?.nome}>
                                            {edital?.banca || edital?.nome.substring(0, 10)}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CombinedSyllabusView = () => {
    const {
        selectedGlobalEditalIds,
        activeSyllabusItems,
        setSyllabusItems,
        showToast
    } = useStudyContext();

    // Use activeSyllabusItems in dependency to re-calculate isStudied when items change
    const mergedData = useMemo(() => {
        const selectedEditais = GLOBAL_EDITAIS.filter(e => selectedGlobalEditalIds.includes(e.id));
        return mergeSyllabi(selectedEditais, activeSyllabusItems);
    }, [selectedGlobalEditalIds, activeSyllabusItems]);

    const handleToggleTopic = (topic) => {
        const newStatus = !topic.isStudied;
        const globalIdsToUpdate = Object.values(topic.originalIds);

        setSyllabusItems(prev => {
            let updated = [...prev];

            // For each global ID associated with this merged topic
            globalIdsToUpdate.forEach(globalId => {
                const existingIndex = updated.findIndex(i => i.globalId === globalId);

                if (existingIndex >= 0) {
                    // Update existing
                    updated[existingIndex] = { ...updated[existingIndex], isStudied: newStatus };
                } else if (newStatus) {
                    // Create new only if we are marking as studied
                    updated.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: topic.nome, // Use the merged name
                        globalId: globalId,
                        isStudied: true,
                        subjectId: "global-progress" // Virtual subject
                    });
                }
            });

            saveToLocalStorage("syllabusItems", updated);
            return updated;
        });

        showToast(newStatus ? "Tópico marcado como estudado!" : "Progresso removido.", "success");
    };

    if (selectedGlobalEditalIds.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
                Nenhum edital selecionado. Vá para a <a href="/editais" className="text-sky-400 hover:underline">Biblioteca</a> para adicionar.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-blue-200">
                <Info size={20} />
                <p className="text-sm">
                    Visualizando união de {selectedGlobalEditalIds.length} editais.
                    Tópicos destacados em <span className="text-amber-400 font-bold">Laranja</span> são exclusivos de apenas um dos editais selecionados.
                    O progresso marcado aqui é salvo globalmente.
                </p>
            </div>

            {mergedData.subjects.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Matérias Unificadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mergedData.subjects.map((subj, idx) => (
                             <div key={idx} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between">
                                <span className="text-slate-200 font-medium">{subj.name}</span>
                                <div className="flex gap-1">
                                     {subj.editalIds.map(eid => (
                                         <div key={eid} className="w-2 h-2 rounded-full bg-sky-500" title={eid}></div>
                                     ))}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

             <div>
                <h3 className="text-lg font-bold text-white mb-4">Tópicos Unificados</h3>
                <MergedSubjectCard
                    subject={{ name: "Todos os Tópicos", editalIds: selectedGlobalEditalIds }}
                    topics={mergedData.topics}
                    onToggleTopic={handleToggleTopic}
                />
            </div>
        </div>
    );
};
