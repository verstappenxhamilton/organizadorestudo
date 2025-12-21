
import React, { useMemo, useState } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { mergeSyllabi } from '../utils/syllabusMerger';
import { GLOBAL_EDITAIS } from '../data/globalEditais';
import { ChevronDown, ChevronUp, Check, Info, Plus } from 'lucide-react';
import { saveToLocalStorage } from '../utils/localStorage';

// Helper to get consistent color for an edital based on its index in the current selection
const getEditalColor = (editalId, selectedIds) => {
    const index = selectedIds.indexOf(editalId);
    if (index === -1) return "bg-slate-500/20 text-slate-300 border-slate-500/20";

    // Cycle through a few distinct colors
    const colors = [
        "bg-sky-500/20 text-sky-300 border-sky-500/20",
        "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
        "bg-violet-500/20 text-violet-300 border-violet-500/20",
        "bg-pink-500/20 text-pink-300 border-pink-500/20",
        "bg-orange-500/20 text-orange-300 border-orange-500/20"
    ];

    return colors[index % colors.length];
};

const GroupedSubjectCard = ({ subject, topics, onToggleTopic, selectedGlobalEditalIds }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);

    if (!topics || topics.length === 0) return null;

    const visibleTopics = topics.slice(0, visibleCount);
    const remainingCount = topics.length - visibleCount;

    const getTopicColorClass = (topic) => {
        if (!topic.isUnique) return "border-slate-700/50 bg-slate-800/50";
        // Unique topics get a generic highlight, but the chips inside show the source
        return "border-amber-500/20 bg-amber-900/10";
    };

    return (
        <div className="bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden mb-4">
            <div
                className="p-4 flex justify-between items-center bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-100">{subject.name}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                        {topics.length} tópicos • {subject.editalIds.length} editais
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </div>

            {isExpanded && (
                <div className="bg-slate-900/50 p-4 space-y-2">
                    {visibleTopics.map(topic => (
                        <div
                            key={topic.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-800 ${getTopicColorClass(topic)}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleTopic(topic);
                            }}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {topic.isStudied ? (
                                    <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 transition-all duration-200">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded border border-slate-600 hover:border-sky-500 transition-colors"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm mb-1 break-words ${topic.isStudied ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                    {topic.nome}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {topic.isUnique && (
                                        <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/20 flex-shrink-0">Único</span>
                                    )}
                                    {topic.editalIds.map(eid => {
                                        const edital = GLOBAL_EDITAIS.find(e => e.id === eid);
                                        const colorClass = getEditalColor(eid, selectedGlobalEditalIds);

                                        const label = (edital?.banca && edital.banca !== "Desconhecida")
                                            ? edital.banca
                                            : (edital?.nome || "Edital").substring(0, 15);

                                        return (
                                            <span key={eid} className={`text-[0.65rem] px-1.5 py-0.5 rounded border ${colorClass} flex-shrink-0`} title={edital?.nome}>
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {remainingCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setVisibleCount(prev => prev + 50);
                            }}
                            className="w-full py-2 flex items-center justify-center gap-2 text-sm text-sky-400 hover:text-sky-300 hover:bg-slate-800/50 rounded-lg transition-colors border border-dashed border-slate-700 mt-2"
                        >
                            <Plus size={16} />
                            Ver mais {remainingCount} tópicos
                        </button>
                    )}
                </div>
            )}
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

    // Memoize heavily to avoid recalculation on unrelated renders
    const mergedSubjects = useMemo(() => {
        if (selectedGlobalEditalIds.length === 0) return [];
        const selectedEditais = GLOBAL_EDITAIS.filter(e => selectedGlobalEditalIds.includes(e.id));
        return mergeSyllabi(selectedEditais, activeSyllabusItems);
    }, [selectedGlobalEditalIds, activeSyllabusItems]);

    const handleToggleTopic = (topic) => {
        const newStatus = !topic.isStudied;
        const globalIdsToUpdate = Object.values(topic.originalIds);

        setSyllabusItems(prev => {
            let updated = [...prev];
            globalIdsToUpdate.forEach(globalId => {
                const existingIndex = updated.findIndex(i => i.globalId === globalId);
                if (existingIndex >= 0) {
                    updated[existingIndex] = { ...updated[existingIndex], isStudied: newStatus };
                } else if (newStatus) {
                    updated.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        name: topic.nome,
                        globalId: globalId,
                        isStudied: true,
                        subjectId: "global-progress"
                    });
                }
            });
            saveToLocalStorage("syllabusItems", updated);
            return updated;
        });
        showToast(newStatus ? "Tópico marcado!" : "Desmarcado.", "success");
    };

    if (selectedGlobalEditalIds.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-xl">
                Nenhum edital selecionado.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-blue-200">
                <Info size={20} />
                <p className="text-sm">
                    Comparando {selectedGlobalEditalIds.length} editais.
                    Agrupados por matéria similar.
                </p>
            </div>

            {mergedSubjects.length === 0 ? (
                <div className="text-center text-slate-500">Nenhum tópico encontrado ou erro na fusão.</div>
            ) : (
                mergedSubjects.map((subject, idx) => (
                    <GroupedSubjectCard
                        key={idx}
                        subject={subject}
                        topics={subject.topics}
                        onToggleTopic={handleToggleTopic}
                        selectedGlobalEditalIds={selectedGlobalEditalIds}
                    />
                ))
            )}
        </div>
    );
};
