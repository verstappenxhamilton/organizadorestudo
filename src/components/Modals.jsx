import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { SyllabusProcessor } from './SyllabusProcessor';

// Modal de Perfil
export const ProfileModal = ({ 
  isOpen, 
  onClose, 
  editingProfile, 
  onSubmit, 
  showToast 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    examDate: '',
    institution: ''
  });

  useEffect(() => {
    if (editingProfile) {
      setFormData({
        name: editingProfile.name || '',
        description: editingProfile.description || '',
        examDate: editingProfile.examDate || '',
        institution: editingProfile.institution || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        examDate: '',
        institution: ''
      });
    }
  }, [editingProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Nome do perfil é obrigatório', 'warning');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {editingProfile ? 'Editar Perfil' : 'Novo Perfil de Concurso'}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome do Concurso <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder=""
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Descrição do concurso..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data da Prova</label>
              <input
                type="date"
                className="form-input"
                value={formData.examDate}
                onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instituição</label>
              <input
                type="text"
                className="form-input"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Ex: CESPE, FCC, VUNESP..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!formData.name.trim()}
              >
                {editingProfile ? 'Salvar Alterações' : 'Criar Concurso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal de Matéria
export const SubjectModal = ({ 
  isOpen, 
  onClose, 
  editingSubject, 
  onSubmit, 
  showToast 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    targetHours: 0
  });

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name || '',
        description: editingSubject.description || '',
        color: editingSubject.color || '#3b82f6',
        targetHours: editingSubject.targetHours || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        targetHours: 0
      });
    }
  }, [editingSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Nome da matéria é obrigatório', 'warning');
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome da Matéria <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Matemática"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meta de Horas (opcional)</label>
              <input
                type="number"
                className="form-input"
                value={formData.targetHours}
                onChange={(e) => setFormData(prev => ({ ...prev, targetHours: parseInt(e.target.value) || 0 }))}
                min="0"
                placeholder="23"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!formData.name.trim()}
              >
                {editingSubject ? 'Salvar Alterações' : 'Salvar Matéria'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal de Detalhes do Item
export const ItemDetailsModal = ({
  isOpen,
  onClose,
  selectedItem,
  subjects,
  studySessions
}) => {
  if (!isOpen || !selectedItem) return null;

  const subjectName = subjects.find(s => s.id === selectedItem.subjectId)?.name || 'Matéria';

  // Buscar sessões relacionadas a este item
  const itemSessions = studySessions.filter(session =>
    session.syllabusItemId === selectedItem.id
  );

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          Detalhes do Item: {selectedItem.name} ({subjectName})
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6">
          {/* Histórico de Estudos */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '12px', fontSize: '1.1rem' }}>
              Histórico de Estudos:
            </h3>

            {itemSessions.length === 0 ? (
              <div style={{
                padding: '16px',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '8px',
                color: '#94a3b8',
                textAlign: 'center'
              }}>
                Nenhuma sessão de estudo registrada para este item.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {itemSessions.map(session => (
                  <div
                    key={session.id}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(71, 85, 105, 0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  >
                    Estudado em {new Date(session.date).toLocaleDateString('pt-BR')} ({(session.duration / 60).toFixed(1)}h)
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Acertos */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '12px', fontSize: '1.1rem' }}>
              Histórico de Acertos:
            </h3>

            {itemSessions.filter(s => s.accuracy !== undefined).length === 0 ? (
              <div style={{
                padding: '16px',
                background: 'rgba(71, 85, 105, 0.2)',
                borderRadius: '8px',
                color: '#94a3b8',
                textAlign: 'center'
              }}>
                Nenhum registro de acertos para este item.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {itemSessions
                  .filter(session => session.accuracy !== undefined)
                  .map(session => (
                    <div
                      key={session.id}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(71, 85, 105, 0.2)',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                    >
                      Acerto: {session.accuracy}% em {new Date(session.date).toLocaleDateString('pt-BR')}, {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 text-right">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Edital (Syllabus)
export const SyllabusModal = ({
  isOpen,
  onClose,
  currentSubjectForSyllabus,
  syllabusItems,
  setSyllabusItems,
  showToast
}) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showToast('Nome do item é obrigatório', 'warning');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      subjectId: currentSubjectForSyllabus.id,
      name: newItemName.trim(),
      isStudied: false,
      createdAt: new Date().toISOString()
    };

    const updatedItems = [...syllabusItems, newItem];
    setSyllabusItems(updatedItems);
    localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
    setNewItemName('');
    showToast('Item adicionado com sucesso!', 'success');
  };

  const handleAddMultipleItems = (items) => {
    const newItems = items.map((itemName, index) => ({
      id: (Date.now() + index).toString(),
      subjectId: currentSubjectForSyllabus.id,
      name: itemName.trim(),
      isStudied: false,
      createdAt: new Date().toISOString()
    }));

    const updatedItems = [...syllabusItems, ...newItems];
    setSyllabusItems(updatedItems);
    localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
  };

  const handleUpdateItemName = (itemId, oldName, newName) => {
    const updatedItems = syllabusItems.map(item =>
      item.id === itemId ? { ...item, name: newName } : item
    );
    setSyllabusItems(updatedItems);
    localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
    showToast('Item atualizado com sucesso!', 'success');
  };

  const handleDeleteItem = (item) => {
    const updatedItems = syllabusItems.filter(i => i.id !== item.id);
    setSyllabusItems(updatedItems);
    localStorage.setItem('syllabusItems', JSON.stringify(updatedItems));
    showToast('Item removido com sucesso!', 'success');
  };

  const handleMoveItemUp = (item) => {
    const currentIndex = syllabusItems.findIndex(i => i.id === item.id);
    if (currentIndex > 0) {
      const newItems = [...syllabusItems];
      [newItems[currentIndex], newItems[currentIndex - 1]] = [newItems[currentIndex - 1], newItems[currentIndex]];
      setSyllabusItems(newItems);
      localStorage.setItem('syllabusItems', JSON.stringify(newItems));
    }
  };

  const handleMoveItemDown = (item) => {
    const currentIndex = syllabusItems.findIndex(i => i.id === item.id);
    if (currentIndex < syllabusItems.length - 1) {
      const newItems = [...syllabusItems];
      [newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]];
      setSyllabusItems(newItems);
      localStorage.setItem('syllabusItems', JSON.stringify(newItems));
    }
  };

  if (!isOpen || !currentSubjectForSyllabus) return null;

  const subjectItems = syllabusItems.filter(item => item.subjectId === currentSubjectForSyllabus.id);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <h2>
          Gerenciar Edital - {currentSubjectForSyllabus.name}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-4 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 100px)', overflowY: 'auto' }}>
          {/* Adicionar item individual */}
          <div className="form-group">
            <label className="form-label">Novo Item do Edital (Individual)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="Nome do tópico/artigo"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Processador de Edital Melhorado */}
          <SyllabusProcessor
            onAddMultipleItems={handleAddMultipleItems}
            showToast={showToast}
            syllabusItems={subjectItems}
            onUpdateItemName={handleUpdateItemName}
            onDeleteItem={handleDeleteItem}
            onMoveItemUp={handleMoveItemUp}
            onMoveItemDown={handleMoveItemDown}
          />
        </div>

        <div className="p-6 border-t border-gray-200 text-right">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Histórico de Sessões
export const SessionHistoryModal = ({
  isOpen,
  onClose,
  selectedSubject,
  studySessions,
  setEditingSession,
  setIsSessionModalOpen,
  setConfirmationDialog
}) => {
  if (!isOpen || !selectedSubject) return null;

  const subjectSessions = studySessions
    .filter(session => session.subjectId === selectedSubject.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalTime = subjectSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60;

  const handleEditSession = (session) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
    onClose();
  };

  const handleDeleteSession = (sessionId) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja deletar esta sessão de estudo?',
      onConfirm: () => {
        // Aqui seria implementada a função de deletar sessão
        setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <h2>
          Histórico de Sessões - {selectedSubject.name}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6">
          {/* Estatísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className="stat-card">
              <div className="stat-value">{subjectSessions.length}</div>
              <div className="stat-label">Total de Sessões</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalTime.toFixed(1)}h</div>
              <div className="stat-label">Tempo Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {subjectSessions.length > 0 ? (totalTime / subjectSessions.length).toFixed(1) : 0}h
              </div>
              <div className="stat-label">Média por Sessão</div>
            </div>
          </div>

          {/* Lista de Sessões */}
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '16px' }}>
              Sessões de Estudo
            </h3>

            {subjectSessions.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                Nenhuma sessão de estudo registrada para esta matéria.
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {subjectSessions.map(session => (
                  <div
                    key={session.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          color: '#f1f5f9',
                          fontWeight: '500',
                          fontSize: '0.9rem'
                        }}>
                          {new Date(session.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span style={{
                          color: '#3b82f6',
                          fontWeight: '500',
                          fontSize: '0.9rem'
                        }}>
                          {(session.duration / 60).toFixed(1)}h
                        </span>
                        {session.accuracy !== undefined && (
                          <span style={{
                            color: '#10b981',
                            fontWeight: '500',
                            fontSize: '0.8rem'
                          }}>
                            {session.accuracy}% acerto
                          </span>
                        )}
                      </div>
                      {session.notes && (
                        <div style={{
                          color: '#cbd5e1',
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          {session.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditSession(session)}
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteSession(session.id)}
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 text-right">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Relatório de Progresso
export const ProgressReportModal = ({
  isOpen,
  onClose,
  subjects,
  studySessions,
  syllabusItems,
  getSubjectStudyTime
}) => {
  if (!isOpen) return null;

  const totalStudyTime = studySessions.reduce((total, session) => total + (session.duration || 0), 0) / 60;
  const totalSyllabusItems = syllabusItems.length;
  const studiedSyllabusItems = syllabusItems.filter(item => item.isStudied).length;
  const averageAccuracy = syllabusItems.length > 0
    ? syllabusItems.reduce((sum, item) => sum + (item.accuracy || 0), 0) / syllabusItems.length
    : 0;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <h2>
          Relatório de Progresso
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6">
          {/* Estatísticas Gerais */}
          <div className="stats-grid" style={{ marginBottom: '30px' }}>
            <div className="stat-card">
              <div className="stat-value">{totalStudyTime.toFixed(1)}h</div>
              <div className="stat-label">Total Horas Estudadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{studiedSyllabusItems}</div>
              <div className="stat-label">Itens do Edital Estudados</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{averageAccuracy.toFixed(1)}%</div>
              <div className="stat-label">Média de Acertos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{studySessions.length}</div>
              <div className="stat-label">Sessões de Estudo</div>
            </div>
          </div>

          {/* Progresso por Matéria */}
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '20px', fontSize: '1.2rem' }}>
              Progresso por Matéria
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {subjects.map(subject => {
                const subjectTime = getSubjectStudyTime(subject.id);
                const subjectSessions = studySessions.filter(s => s.subjectId === subject.id);
                const subjectSyllabusItems = syllabusItems.filter(item => item.subjectId === subject.id);
                const studiedSubjectItems = subjectSyllabusItems.filter(item => item.isStudied);
                const progress = subjectSyllabusItems.length > 0 ? (studiedSubjectItems.length / subjectSyllabusItems.length) * 100 : 0;

                return (
                  <div key={subject.id} style={{
                    padding: '15px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ color: '#f1f5f9', margin: 0 }}>{subject.name}</h4>
                      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {subjectTime.toFixed(1)}h • {subjectSessions.length} sessões
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(148, 163, 184, 0.2)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '5px',
                      fontSize: '0.8rem',
                      color: '#94a3b8'
                    }}>
                      <span>{studiedSubjectItems.length} de {subjectSyllabusItems.length} itens</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 text-right">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
