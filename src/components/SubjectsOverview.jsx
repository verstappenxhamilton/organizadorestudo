import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Eye,
  Target
} from 'lucide-react';

export const SubjectsOverview = ({
  subjects,
  syllabusItems,
  setSyllabusItems,
  expandedSubjects,
  setExpandedSubjects,
  getSubjectStudyTime,
  setSelectedSyllabusItem,
  setIsItemDetailsModalOpen,
  studySessions
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [tempAccuracy, setTempAccuracy] = useState('');
  const [tempWeight, setTempWeight] = useState('');

  const filterOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'nao-estudados', label: 'Não estudados' },
    { value: 'com-revisao', label: 'Com revisão' },
    { value: 'estudados-sem-revisao', label: 'Estudados (sem revisão)' }
  ];

  const getAccuracyClasses = (accuracy) => {
    if (accuracy >= 80) return 'bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/40';
    if (accuracy >= 60) return 'bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-400/40';
    if (accuracy >= 40) return 'bg-orange-500/20 text-orange-200 ring-1 ring-inset ring-orange-400/40';
    return 'bg-rose-500/20 text-rose-200 ring-1 ring-inset ring-rose-400/40';
  };

  const getWeightTint = (weight) => {
    if (weight === undefined || weight === null) return undefined;

    const intensity = Math.min(weight / 100, 1);
    const base = 0.06 + intensity * 0.14;

    return `rgba(248, 113, 113, ${base.toFixed(3)})`;
  };

  const calculateNextReviewDate = (accuracy) => {
    const today = new Date();
    let daysToAdd = 1;

    if (accuracy >= 90) {
      daysToAdd = 7;
    } else if (accuracy >= 80) {
      daysToAdd = 5;
    } else if (accuracy >= 70) {
      daysToAdd = 3;
    } else if (accuracy >= 60) {
      daysToAdd = 2;
    } else {
      daysToAdd = 1;
    }

    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
  };

  const getItemAccuracyFromSessions = (itemId) => {
    if (!studySessions) return null;

    const itemSessions = studySessions.filter(session =>
      session.syllabusItemId === itemId &&
      session.accuracy !== undefined &&
      session.accuracy !== null
    );

    if (itemSessions.length === 0) return null;

    const totalAccuracy = itemSessions.reduce((sum, session) => sum + session.accuracy, 0);
    return Math.round(totalAccuracy / itemSessions.length);
  };

  const handleSaveAccuracy = (itemId) => {
    const accuracy = parseFloat(tempAccuracy);

    if (accuracy >= 0 && accuracy <= 100) {
      const nextReviewDate = calculateNextReviewDate(accuracy);

      const updatedItems = syllabusItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              accuracy,
              lastAccuracyUpdate: new Date().toISOString(),
              nextReviewDate,
              isStudied: true
            }
          : item
      );
      setSyllabusItems(updatedItems);
      localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
    }

    setEditingItem(null);
    setTempAccuracy('');
    setTempWeight('');
  };

  const handleSaveWeight = (itemId) => {
    const weight = parseFloat(tempWeight);

    if (weight >= 0 && weight <= 100) {
      const updatedItems = syllabusItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              weight
            }
          : item
      );
      setSyllabusItems(updatedItems);
      localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
    }

    setEditingItem(null);
    setTempAccuracy('');
    setTempWeight('');
  };

  const filterItems = (items, subjectId) => {
    const filter = activeFilters[subjectId] || 'todos';

    switch (filter) {
      case 'nao-estudados':
        return items.filter(item => !item.isStudied);
      case 'com-revisao':
        return items.filter(item => item.isStudied && item.accuracy >= 0);
      case 'estudados-sem-revisao':
        return items.filter(item => item.isStudied && (item.accuracy === undefined || item.accuracy < 0));
      default:
        return items;
    }
  };

  const isSubItem = (itemName) => {
    if (!itemName || typeof itemName !== 'string') return false;

    return itemName.startsWith(' - ') ||
      itemName.startsWith('- ') ||
      /^\d+\.\d+/.test(itemName.trim());
  };

  const getHierarchyLevel = (itemName) => {
    if (!itemName || typeof itemName !== 'string') return 0;

    const trimmed = itemName.trim();

    if (trimmed.startsWith('- ') || itemName.startsWith(' - ')) {
      return 1;
    }

    const numberMatch = trimmed.match(/^(\d+\.)+/);
    if (numberMatch) {
      const dots = (numberMatch[0].match(/\./g) || []).length;
      return dots > 1 ? dots - 1 : 0;
    }

    return 0;
  };

  const indentationClasses = ['pl-0', 'pl-4', 'pl-8', 'pl-12'];

  return (
    <div className="space-y-6">
      {subjects.map(subject => {
        const subjectSyllabusItems = syllabusItems.filter(item => item.subjectId === subject.id);
        const filteredItems = filterItems(subjectSyllabusItems, subject.id);
        const studiedItems = subjectSyllabusItems.filter(item => item.isStudied);
        const studiedPercentage = subjectSyllabusItems.length > 0
          ? (studiedItems.length / subjectSyllabusItems.length) * 100
          : 0;
        const totalStudyTime = getSubjectStudyTime(subject.id);
        const averageAccuracy = studiedItems.length > 0
          ? studiedItems.reduce((sum, item) => sum + (item.accuracy || 0), 0) / studiedItems.length
          : 0;
        const isExpanded = expandedSubjects[subject.id];
        const formattedStudyTime = Number.isFinite(totalStudyTime)
          ? totalStudyTime.toFixed(1)
          : '0.0';

        return (
          <div
            key={subject.id}
            className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition-colors duration-200 hover:border-sky-400/40"
          >
            <button
              type="button"
              onClick={() => {
                const newExpanded = { ...expandedSubjects };
                newExpanded[subject.id] = !newExpanded[subject.id];
                setExpandedSubjects(newExpanded);
              }}
              className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left hover:bg-white/5"
            >
              <div className="flex-1 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {subject.name}
                  </span>
                  {subject.category && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                      {subject.category}
                    </span>
                  )}
                </div>

                <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>{studiedItems.length} de {subjectSyllabusItems.length || 0} itens mapeados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-sky-300" />
                    <span>Média de acerto {averageAccuracy.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-300" />
                    <span>{formattedStudyTime}h estudadas</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                    <span>Progresso do edital</span>
                    <span>{Math.round(studiedPercentage)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500"
                      style={{ width: `${Math.max(Math.round(studiedPercentage), 4)}%` }}
                    />
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                {isExpanded ? 'Recolher' : 'Detalhar'}
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-white/5 bg-slate-950/50 px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    <BookOpen size={14} />
                    <span>Itens do edital</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map(option => {
                      const isActive = (activeFilters[subject.id] || 'todos') === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: option.value }))}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                            isActive
                              ? 'border-sky-400/60 bg-sky-500/15 text-sky-200 focus-visible:ring-sky-400'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-sky-400/40 hover:text-sky-100 focus-visible:ring-white/40'
                          }`}
                          aria-pressed={isActive}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <p className="text-sm font-medium text-slate-300">Nenhum item corresponde ao filtro selecionado.</p>
                    <p className="text-xs text-slate-500">Ajuste os filtros ou cadastre novos tópicos para esta matéria.</p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {filteredItems.map(item => {
                      const hierarchyLevel = getHierarchyLevel(item.name);
                      const indentationClass = indentationClasses[Math.min(hierarchyLevel, indentationClasses.length - 1)];
                      const isSubItemFlag = isSubItem(item.name);
                      const sessionAccuracy = getItemAccuracyFromSessions(item.id);
                      const displayAccuracy = sessionAccuracy !== null ? sessionAccuracy : item.accuracy;
                      const itemWeightTint = getWeightTint(item.weight);

                      return (
                        <div
                          key={item.id}
                          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-200 hover:border-sky-400/50 hover:bg-white/[0.06] ${
                            isSubItemFlag ? 'pr-4' : ''
                          }`}
                          style={{
                            marginLeft: hierarchyLevel ? `${hierarchyLevel * 12}px` : undefined,
                            borderLeft: isSubItemFlag ? '2px solid rgba(56, 189, 248, 0.35)' : undefined,
                            backgroundColor: itemWeightTint || undefined
                          }}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className={`flex flex-col gap-2 text-sm text-slate-200 ${indentationClass}`}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium leading-tight text-white">
                                  {item.name}
                                </span>
                                {item.isStudied && (
                                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-200">
                                    Estudado
                                  </span>
                                )}
                                {item.nextReviewDate && (
                                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-200">
                                    Próxima revisão {new Date(item.nextReviewDate).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                {displayAccuracy !== undefined && (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${getAccuracyClasses(displayAccuracy)}`}
                                    title={sessionAccuracy !== null ? 'Baseado nas sessões de estudo' : 'Definido manualmente'}
                                  >
                                    <Target className="h-3.5 w-3.5" />
                                    {displayAccuracy}% acerto
                                  </span>
                                )}
                                {item.weight !== undefined && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-200">
                                    Peso {item.weight}%
                                  </span>
                                )}
                                {item.lastAccuracyUpdate && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[0.65rem] text-slate-300">
                                    Atualizado em {new Date(item.lastAccuracyUpdate).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSyllabusItem(item);
                                  setIsItemDetailsModalOpen(true);
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-sky-400/60 hover:text-sky-100"
                                title="Histórico do item"
                              >
                                <Eye size={16} />
                                <span className="sr-only">Abrir histórico do item</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(item.id);
                                  setTempAccuracy(item.accuracy?.toString() || '');
                                  setTempWeight(item.weight?.toString() || '');
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-sky-400/60 hover:text-sky-100"
                                title="Editar acerto e peso"
                              >
                                <Edit2 size={16} />
                                <span className="sr-only">Editar acerto e peso</span>
                              </button>
                            </div>
                          </div>

                          {editingItem === item.id && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200">
                              <div className="grid gap-4 sm:grid-cols-3">
                                <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                                  % de acerto
                                  <input
                                    type="number"
                                    value={tempAccuracy}
                                    onChange={(e) => setTempAccuracy(e.target.value)}
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                  />
                                </label>

                                <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                                  % de peso
                                  <input
                                    type="number"
                                    value={tempWeight}
                                    onChange={(e) => setTempWeight(e.target.value)}
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                  />
                                </label>

                                <div className="flex flex-col justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                                  <span className="font-medium text-slate-300">Sugestão:</span>
                                  <p>Defina o acerto para atualizar a próxima revisão automaticamente.</p>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveAccuracy(item.id)}
                                  className="inline-flex items-center gap-2 rounded-full bg-sky-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={!tempAccuracy}
                                >
                                  Salvar % de acerto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveWeight(item.id)}
                                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={!tempWeight}
                                >
                                  Salvar peso
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItem(null);
                                    setTempAccuracy('');
                                    setTempWeight('');
                                  }}
                                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-300/40 hover:text-white"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
