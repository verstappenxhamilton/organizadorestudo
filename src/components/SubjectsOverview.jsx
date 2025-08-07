import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit2 } from 'lucide-react';

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

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#10b981'; // Verde
    if (accuracy >= 60) return '#f59e0b'; // Amarelo
    if (accuracy >= 40) return '#f97316'; // Laranja
    return '#ef4444'; // Vermelho
  };

  const getWeightColor = (weight) => {
    const intensity = Math.min(weight / 100, 1);
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`; // Vermelho com intensidade baseada no peso
  };

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
    <div className="subjects-overview-new">
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

        return (
          <div key={subject.id} className="subject-overview-new">
            <div className="subject-header-new">
              <div className="subject-info">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 className="subject-name" style={{ margin: 0 }}>{subject.name}</h3>
                  <button
                    className="expand-btn"
                    onClick={() => {
                      const newExpanded = { ...expandedSubjects };
                      newExpanded[subject.id] = !newExpanded[subject.id];
                      setExpandedSubjects(newExpanded);
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <>
                    <div className="subject-stats-compact" style={{
                      marginBottom: '6px',
                      fontSize: '0.7rem',
                      color: '#64748b',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: '500',
                        fontSize: '0.65rem'
                      }}>
                        {studiedItems.length} de {subjectSyllabusItems.length} itens ({studiedPercentage.toFixed(0)}%)
                      </span>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: '500',
                        fontSize: '0.65rem'
                      }}>
                        Média: {averageAccuracy.toFixed(0)}%
                      </span>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontWeight: '500',
                        fontSize: '0.65rem'
                      }}>
                        {totalStudyTime.toFixed(1)}h estudadas
                      </span>
                    </div>

                    <div className="subject-controls" style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginBottom: '6px'
                    }}>
                      <div className="filter-tabs" style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        <button
                          className={`filter-tab ${(!activeFilters[subject.id] || activeFilters[subject.id] === 'todos') ? 'active' : ''}`}
                          onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: 'todos' }))}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: (!activeFilters[subject.id] || activeFilters[subject.id] === 'todos') ? '#3b82f6' : '#e2e8f0',
                            color: (!activeFilters[subject.id] || activeFilters[subject.id] === 'todos') ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Todos
                        </button>
                        <button
                          className={`filter-tab ${activeFilters[subject.id] === 'nao-estudados' ? 'active' : ''}`}
                          onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: 'nao-estudados' }))}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: activeFilters[subject.id] === 'nao-estudados' ? '#3b82f6' : '#e2e8f0',
                            color: activeFilters[subject.id] === 'nao-estudados' ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Não Estudados
                        </button>
                        <button
                          className={`filter-tab ${activeFilters[subject.id] === 'com-revisao' ? 'active' : ''}`}
                          onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: 'com-revisao' }))}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: activeFilters[subject.id] === 'com-revisao' ? '#3b82f6' : '#e2e8f0',
                            color: activeFilters[subject.id] === 'com-revisao' ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Com Revisão
                        </button>
                        <button
                          className={`filter-tab ${activeFilters[subject.id] === 'estudados-sem-revisao' ? 'active' : ''}`}
                          onClick={() => setActiveFilters(prev => ({ ...prev, [subject.id]: 'estudados-sem-revisao' }))}
                          style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: activeFilters[subject.id] === 'estudados-sem-revisao' ? '#3b82f6' : '#e2e8f0',
                            color: activeFilters[subject.id] === 'estudados-sem-revisao' ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Estudados ({studiedPercentage.toFixed(0)}% Rev.)
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="subject-content-new">
                {filteredItems.length === 0 ? (
                  <div className="no-items">
                    Nenhum item corresponde ao filtro selecionado.
                  </div>
                ) : (
                  <div className="syllabus-items-list">
                    {filteredItems.map(item => {
                      const hierarchyLevel = getHierarchyLevel(item.name);
                      const isSubItemFlag = isSubItem(item.name);

                      return (
                        <div
                          key={item.id}
                          className="syllabus-item-row"
                          style={{
                            backgroundColor: item.weight ? getWeightColor(item.weight) : undefined,
                            marginLeft: `${hierarchyLevel * 20}px`, // Recuo de 20px por nível
                            borderLeft: isSubItemFlag ? '3px solid rgba(59, 130, 246, 0.3)' : 'none',
                            paddingLeft: isSubItemFlag ? '12px' : '8px'
                          }}
                        >
                          <div className="item-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <span
                                className="item-name"
                                style={{
                                  fontSize: isSubItemFlag ? '0.85rem' : '0.9rem',
                                  fontWeight: isSubItemFlag ? '400' : '500',
                                  color: isSubItemFlag ? '#94a3b8' : '#e2e8f0'
                                }}
                              >
                                {item.name}
                              </span>
                            </div>

                            {/* Fixed indicators on the right */}
                            <div className="item-indicators" style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              position: 'relative',
                              flexShrink: 0 
                            }}>
                              {(() => {
                                // Priorizar percentual de acerto das sessões, depois o manual
                                const sessionAccuracy = getItemAccuracyFromSessions(item.id);
                                const displayAccuracy = sessionAccuracy !== null ? sessionAccuracy : item.accuracy;

                                return displayAccuracy !== undefined && (
                                  <div
                                    className="accuracy-badge"
                                    style={{
                                      backgroundColor: getAccuracyColor(displayAccuracy),
                                      color: 'white',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      minWidth: '35px',
                                      textAlign: 'center'
                                    }}
                                    title={sessionAccuracy !== null ? 'Baseado nas sessões de estudo' : 'Definido manualmente'}
                                  >
                                    {displayAccuracy}%
                                  </div>
                                );
                              })()}

                              {item.weight !== undefined && (
                                <div
                                  className="weight-badge"
                                  style={{
                                    backgroundColor: getWeightColor(item.weight),
                                    color: '#333',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    minWidth: '35px',
                                    textAlign: 'center'
                                  }}
                                  title="Peso da questão"
                                >
                                  {item.weight}%
                                </div>
                              )}

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  className="details-btn"
                                  onClick={() => {
                                    setSelectedSyllabusItem(item);
                                    setIsItemDetailsModalOpen(true);
                                  }}
                                  title="Histórico de Item"
                                >
                                  <Eye size={12} />
                                </button>

                                <button
                                  className="details-btn"
                                  onClick={() => {
                                    setEditingItem(item.id);
                                    setTempAccuracy(item.accuracy?.toString() || '');
                                    setTempWeight(item.weight?.toString() || '');
                                  }}
                                  title="Editar % Acerto e Peso"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                        {editingItem === item.id && (
                          <div className="edit-controls" style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderRadius: '6px',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>% Acerto:</label>
                              <input
                                type="number"
                                value={tempAccuracy}
                                onChange={(e) => setTempAccuracy(e.target.value)}
                                className="accuracy-input"
                                style={{ width: '60px' }}
                                min="0"
                                max="100"
                                placeholder="0-100"
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>% Peso:</label>
                              <input
                                type="number"
                                value={tempWeight}
                                onChange={(e) => setTempWeight(e.target.value)}
                                className="accuracy-input"
                                style={{ width: '60px' }}
                                min="0"
                                max="100"
                                placeholder="0-100"
                              />
                            </div>

                            <button
                              className="save-btn"
                              onClick={() => handleSaveAccuracy(item.id)}
                              style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                              disabled={!tempAccuracy}
                            >
                              Salvar %
                            </button>

                            <button
                              className="save-btn"
                              onClick={() => handleSaveWeight(item.id)}
                              style={{ fontSize: '0.7rem', padding: '4px 8px', background: '#059669' }}
                              disabled={!tempWeight}
                            >
                              Salvar Peso
                            </button>

                            <button
                              className="save-btn"
                              onClick={() => {
                                setEditingItem(null);
                                setTempAccuracy('');
                                setTempWeight('');
                              }}
                              style={{
                                fontSize: '0.7rem',
                                padding: '4px 8px',
                                background: '#6b7280'
                              }}
                            >
                              Cancelar
                            </button>
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
