import React, { useState } from 'react';
import { CalendarClock, ChevronDown, ChevronUp, Eye, Edit2 } from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos os itens' },
  { id: 'nao-estudados', label: 'Não estudados' },
  { id: 'com-revisao', label: 'Com revisão' },
  { id: 'estudados-sem-revisao', label: 'Revisão pendente' }
];

const getDaysDifferenceFromToday = (dateString) => {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return null;
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const formatReviewDateLabel = (dateString) => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
};

const describeReviewStatus = (dateString) => {
  const diff = getDaysDifferenceFromToday(dateString);
  if (diff === null) return null;

  if (diff < 0) {
    return {
      variant: 'overdue',
      label: `Atrasada há ${Math.abs(diff)}d (${formatReviewDateLabel(dateString)})`
    };
  }

  if (diff === 0) {
    return {
      variant: 'today',
      label: 'Hoje'
    };
  }

  if (diff === 1) {
    return {
      variant: 'soon',
      label: 'Amanhã'
    };
  }

  return {
    variant: 'upcoming',
    label: `Em ${diff} dias (${formatReviewDateLabel(dateString)})`
  };
};

const getAccuracyVariant = (accuracy) => {
  if (accuracy >= 85) return 'high';
  if (accuracy >= 70) return 'medium';
  if (accuracy >= 50) return 'low';
  return 'critical';
};

const getWeightColor = (weight) => {
  const intensity = Math.min(weight / 100, 1);
  return `rgba(248, 113, 113, ${0.25 + intensity * 0.35})`;
};

const truncate = (value = '', max = 40) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const getSubjectUpcomingReview = (items) => {
  const scheduled = items
    .filter((item) => item.nextReviewDate)
    .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

  return scheduled[0];
};

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

  const calculateNextReviewDate = (accuracy) => {
    const today = new Date();
    let daysToAdd = 1;

    if (accuracy >= 90) {
      daysToAdd = 7; // 1 semana
    } else if (accuracy >= 80) {
      daysToAdd = 5; // 5 dias
    } else if (accuracy >= 70) {
      daysToAdd = 3; // 3 dias
    } else if (accuracy >= 60) {
      daysToAdd = 2; // 2 dias
    } else {
      daysToAdd = 1; // 1 dia
    }

    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
  };

  // Calcular percentual de acerto baseado nas sessões
  const getItemAccuracyFromSessions = (itemId) => {
    if (!studySessions) return null;

    const itemSessions = studySessions.filter(session =>
      session.syllabusItemId === itemId &&
      session.accuracy !== undefined &&
      session.accuracy !== null
    );

    if (itemSessions.length === 0) return null;

    // Usar a média dos percentuais de acerto das sessões
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
              accuracy: accuracy,
              lastAccuracyUpdate: new Date().toISOString(),
              nextReviewDate: nextReviewDate,
              isStudied: true
            }
          : item
      );
      setSyllabusItems(updatedItems);
      // Salvar no localStorage
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
              weight: weight
            }
          : item
      );
      setSyllabusItems(updatedItems);
      // Salvar no localStorage
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

  // Função para detectar se um item é uma submatéria
  const isSubItem = (itemName) => {
    if (!itemName || typeof itemName !== 'string') return false;
    // Detectar itens que começam com " - " ou números seguidos de ponto (ex: "1.1", "2.3")
    return itemName.startsWith(' - ') ||
           itemName.startsWith('- ') ||
           /^\d+\.\d+/.test(itemName.trim());
  };

  // Função para detectar nível de hierarquia baseado na numeração
  const getHierarchyLevel = (itemName) => {
    if (!itemName || typeof itemName !== 'string') return 0;

    const trimmed = itemName.trim();

    // Detectar itens que começam com " - " ou "- "
    if (trimmed.startsWith('- ') || itemName.startsWith(' - ')) {
      return 1;
    }

    // Detectar numeração (ex: "1.", "1.1", "1.1.1")
    const numberMatch = trimmed.match(/^(\d+\.)+/);
    if (numberMatch) {
      const dots = (numberMatch[0].match(/\./g) || []).length;
      return dots > 1 ? dots - 1 : 0; // 1. = nível 0, 1.1 = nível 1, 1.1.1 = nível 2
    }

    return 0;
  };

  return (
    <div className="subjects-overview">
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
        const upcomingReview = getSubjectUpcomingReview(subjectSyllabusItems);
        const upcomingReviewStatus = upcomingReview ? describeReviewStatus(upcomingReview.nextReviewDate) : null;

        const filterCounts = {
          todos: subjectSyllabusItems.length,
          'nao-estudados': subjectSyllabusItems.filter(item => !item.isStudied).length,
          'com-revisao': subjectSyllabusItems.filter(item => item.isStudied && item.accuracy >= 0).length,
          'estudados-sem-revisao': subjectSyllabusItems.filter(item => item.isStudied && (item.accuracy === undefined || item.accuracy < 0)).length
        };

        return (
          <article
            key={subject.id}
            className={`subject-card ${isExpanded ? 'subject-card--expanded' : ''}`}
          >
            <header className="subject-card__header">
              <div className="subject-card__title-row">
                <div>
                  <h3 className="subject-card__title">{subject.name}</h3>
                  <div className="subject-card__meta">
                    <span className="subject-card__meta-pill">{subjectSyllabusItems.length} itens</span>
                    <span className="subject-card__meta-pill">{studiedItems.length} estudados</span>
                    <span className="subject-card__meta-pill">{totalStudyTime.toFixed(1)}h investidas</span>
                  </div>
                </div>
                <button
                  className="subject-card__toggle"
                  onClick={() => {
                    const newExpanded = { ...expandedSubjects };
                    newExpanded[subject.id] = !newExpanded[subject.id];
                    setExpandedSubjects(newExpanded);
                  }}
                  aria-label={isExpanded ? 'Recolher matéria' : 'Expandir matéria'}
                  type="button"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <div className="subject-card__insights">
                <div className="subject-card__progress">
                  <div className="subject-card__progress-track">
                    <div
                      className="subject-card__progress-fill"
                      style={{ width: `${studiedPercentage}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="subject-card__progress-meta">
                    <span>{studiedPercentage.toFixed(0)}% do edital mapeado</span>
                    <span>Média de acertos {averageAccuracy.toFixed(0)}%</span>
                  </div>
                </div>

                {upcomingReviewStatus ? (
                  <div className={`subject-card__next-review subject-card__next-review--${upcomingReviewStatus.variant}`}>
                    <CalendarClock size={16} />
                    <div className="subject-card__next-review-text">
                      <span className="value">{upcomingReviewStatus.label}</span>
                      <span className="hint">{truncate(upcomingReview?.name || '')}</span>
                    </div>
                  </div>
                ) : (
                  studiedItems.length > 0 && (
                    <div className="subject-card__next-review subject-card__next-review--empty">
                      <CalendarClock size={16} />
                      <div className="subject-card__next-review-text">
                        <span className="value">Sem revisão agendada</span>
                        <span className="hint">Defina a próxima revisão para manter o ritmo</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </header>

            {isExpanded && (
              <div className="subject-card__body">
                <div className="subject-card__filters">
                  {FILTER_OPTIONS.map(option => {
                    const isActive = (activeFilters[subject.id] || 'todos') === option.id;

                    return (
                      <button
                        key={option.id}
                        className={`filter-pill ${isActive ? 'filter-pill--active' : ''}`}
                        onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: option.id }))}
                        type="button"
                      >
                        <span>{option.label}</span>
                        <span className="filter-pill__counter">{filterCounts[option.id]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="subject-card__content">
                  {filteredItems.length === 0 ? (
                    <div className="subject-card__empty">Nenhum item corresponde ao filtro selecionado.</div>
                  ) : (
                    filteredItems.map(item => {
                      const hierarchyLevel = getHierarchyLevel(item.name);
                      const isSubItemFlag = isSubItem(item.name);
                      const sessionAccuracy = getItemAccuracyFromSessions(item.id);
                      const displayAccuracy = sessionAccuracy !== null && sessionAccuracy !== undefined
                        ? sessionAccuracy
                        : item.accuracy;
                      const accuracyVariant = displayAccuracy !== undefined ? getAccuracyVariant(displayAccuracy) : null;
                      const reviewStatus = item.nextReviewDate ? describeReviewStatus(item.nextReviewDate) : null;

                      return (
                        <div
                          key={item.id}
                          className={`syllabus-item-card ${isSubItemFlag ? 'syllabus-item-card--nested' : ''}`}
                          style={{
                            marginLeft: `${hierarchyLevel * 20}px`
                          }}
                        >
                          <div className="syllabus-item-card__header">
                            <div className="syllabus-item-card__title-group">
                              <span
                                className="syllabus-item-card__marker"
                                style={{ backgroundColor: item.weight !== undefined ? getWeightColor(item.weight) : undefined }}
                                aria-hidden
                              />
                              <span className="syllabus-item-card__title">{item.name}</span>
                            </div>
                            <div className="syllabus-item-card__action-group">
                              <button
                                className="subject-card__icon-btn"
                                onClick={() => {
                                  setSelectedSyllabusItem(item);
                                  setIsItemDetailsModalOpen(true);
                                }}
                                title="Histórico do item"
                                type="button"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                className="subject-card__icon-btn"
                                onClick={() => {
                                  setEditingItem(item.id);
                                  setTempAccuracy(item.accuracy?.toString() || '');
                                  setTempWeight(item.weight?.toString() || '');
                                }}
                                title="Editar percentuais"
                                type="button"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="syllabus-item-card__meta">
                            {displayAccuracy !== undefined && (
                              <span
                                className={`item-chip item-chip--accuracy item-chip--accuracy-${accuracyVariant}`}
                                title={sessionAccuracy !== null ? 'Baseado nas sessões registradas' : 'Definido manualmente'}
                              >
                                {displayAccuracy}% acerto
                                {sessionAccuracy !== null && (
                                  <span className="item-chip__note">auto</span>
                                )}
                              </span>
                            )}

                            {item.weight !== undefined && (
                              <span className="item-chip item-chip--weight">Peso {item.weight}%</span>
                            )}

                            {reviewStatus && (
                              <span className={`item-chip item-chip--review item-chip--review-${reviewStatus.variant}`}>
                                Revisão {reviewStatus.label.toLowerCase()}
                              </span>
                            )}

                            {!item.isStudied && (
                              <span className="item-chip item-chip--status">Ainda não estudado</span>
                            )}
                          </div>

                          {editingItem === item.id && (
                            <div className="syllabus-item-card__editor">
                              <div className="editor-field">
                                <label htmlFor={`accuracy-${item.id}`}>% de acerto</label>
                                <input
                                  id={`accuracy-${item.id}`}
                                  type="number"
                                  value={tempAccuracy}
                                  onChange={(e) => setTempAccuracy(e.target.value)}
                                  className="editor-input"
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                />
                              </div>

                              <div className="editor-field">
                                <label htmlFor={`weight-${item.id}`}>Peso no edital</label>
                                <input
                                  id={`weight-${item.id}`}
                                  type="number"
                                  value={tempWeight}
                                  onChange={(e) => setTempWeight(e.target.value)}
                                  className="editor-input"
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                />
                              </div>

                              <div className="editor-actions">
                                <button
                                  className="editor-btn editor-btn--primary"
                                  onClick={() => handleSaveAccuracy(item.id)}
                                  disabled={!tempAccuracy}
                                  type="button"
                                >
                                  Salvar % acerto
                                </button>
                                <button
                                  className="editor-btn editor-btn--success"
                                  onClick={() => handleSaveWeight(item.id)}
                                  disabled={!tempWeight}
                                  type="button"
                                >
                                  Salvar peso
                                </button>
                                <button
                                  className="editor-btn editor-btn--ghost"
                                  onClick={() => {
                                    setEditingItem(null);
                                    setTempAccuracy('');
                                    setTempWeight('');
                                  }}
                                  type="button"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
