import React, { useState, useEffect } from 'react';

export const SessionModal = ({ 
  isOpen, 
  onClose, 
  editingSession, 
  initialSessionData,
  currentSubjectForSession,
  subjects,
  syllabusItems,
  onSubmit, 
  showToast 
}) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    date: '',
    duration: 0,
    topics: '',
    notes: '',
    difficulty: 'medium',
    satisfaction: 5
  });

  useEffect(() => {
    if (editingSession) {
      setFormData({
        subjectId: editingSession.subjectId || '',
        date: editingSession.date || '',
        duration: editingSession.duration || 0,
        topics: editingSession.topics || '',
        notes: editingSession.notes || '',
        difficulty: editingSession.difficulty || 'medium',
        satisfaction: editingSession.satisfaction || 5
      });
    } else if (initialSessionData) {
      setFormData({
        subjectId: initialSessionData.subjectId || '',
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        topics: '',
        notes: '',
        difficulty: 'medium',
        satisfaction: 5
      });
    } else {
      setFormData({
        subjectId: currentSubjectForSession || '',
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        topics: '',
        notes: '',
        difficulty: 'medium',
        satisfaction: 5
      });
    }
  }, [editingSession, initialSessionData, currentSubjectForSession]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subjectId) {
      showToast('Selecione uma matéria', 'warning');
      return;
    }

    if (!formData.date) {
      showToast('Data é obrigatória', 'warning');
      return;
    }

    if (formData.duration <= 0) {
      showToast('Duração deve ser maior que zero', 'warning');
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
      <div className="modal session-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {editingSession ? 'Editar Sessão' : 'Registrar Sessão de Estudo'}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6 session-modal-content custom-scrollbar">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Matéria <span className="text-red-500">*</span></label>
              <select
                className="form-select"
                value={formData.subjectId}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                required
              >
                <option value="">Selecione uma matéria</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duração (horas) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={formData.duration / 60}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) * 60 || 0 }))}
                min="0.1"
                placeholder="Ex: 1.5"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Item do Edital (opcional)</label>
              <select
                className="form-select"
                value={formData.syllabusItemId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, syllabusItemId: e.target.value }))}
              >
                <option value="">Selecione um item</option>
                {formData.subjectId && syllabusItems
                  .filter(item => item.subjectId === formData.subjectId)
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Percentual de Acerto (%) (opcional)</label>
              <input
                type="number"
                className="form-input"
                value={formData.accuracy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, accuracy: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder=""
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.isReview || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isReview: e.target.checked }))}
                />
                <span className="text-sm text-gray-700">Esta sessão foi de revisão?</span>
              </label>
            </div>

            {/* Agendamento de Revisão */}
            <div className="form-group">
              <label className="form-label">Agendar próxima revisão em:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[1, 3, 7, 15, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      const nextReviewDate = new Date();
                      nextReviewDate.setDate(nextReviewDate.getDate() + days);
                      setFormData(prev => ({
                        ...prev,
                        nextReviewDate: nextReviewDate.toISOString().split('T')[0],
                        reviewDays: days
                      }));
                    }}
                    style={{
                      padding: '8px 16px',
                      background: formData.reviewDays === days ? '#8b5cf6' : '#6b46c1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {days} dia{days > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              {formData.nextReviewDate && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  color: '#8b5cf6'
                }}>
                  Revisão será agendada para: {new Date(formData.nextReviewDate).toLocaleDateString('pt-BR')}
                </div>
              )}

              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.noNextReview || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    noNextReview: e.target.checked,
                    nextReviewDate: e.target.checked ? null : prev.nextReviewDate
                  }))}
                />
                <span className="text-sm text-gray-700">Não agendar revisão</span>
              </label>
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingSession ? 'Salvar Alterações' : 'Registrar Sessão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
