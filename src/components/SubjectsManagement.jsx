import React from 'react';
import {
  PlusCircle,
  PlayCircle,
  ListChecks,
  Trash2,
  CheckCircle,
  Edit,
  History
} from 'lucide-react';

export const SubjectsManagement = ({
  subjects,
  studySessions,
  setIsSubjectModalOpen,
  setCurrentSubjectForSession,
  setIsSessionModalOpen,
  setCurrentSubjectForSyllabus,
  setIsSyllabusModalOpen,
  setEditingSubject,
  setConfirmationDialog,
  handleDeleteSubject,
  getSubjectStudyTime,
  calculateSubjectProgress,
  setIsSessionHistoryModalOpen,
  setSelectedSubjectForHistory
}) => {
  return (
    <div className="card">
      <div className="subject-overview-header">
        <h2>
          Matérias (Gerenciamento)
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsSubjectModalOpen(true)}
          >
            <PlusCircle size={14} />
            Nova Matéria
          </button>
          <button
            className="btn btn-success"
            onClick={() => {
              setCurrentSubjectForSession(null);
              setIsSessionModalOpen(true);
            }}
          >
            <PlayCircle size={14} />
            Registrar Sessão
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        {subjects.map(subject => (
          <div key={subject.id} className="subject-card">
            <div className="subject-header">
              <div className="subject-title">{subject.name}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                  Horas Estudadas: {getSubjectStudyTime(subject.id).toFixed(1)}h
                </span>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                  Sessões: {studySessions.filter(s => s.subjectId === subject.id).length}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${calculateSubjectProgress(subject.id)}%` }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Progresso do Edital: {calculateSubjectProgress(subject.id)}%
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-success"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  setCurrentSubjectForSession(subject.id);
                  setIsSessionModalOpen(true);
                }}
              >
                <CheckCircle size={12} />
                Sessão
              </button>
              <button
                className="btn btn-info"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  setCurrentSubjectForSyllabus(subject);
                  setIsSyllabusModalOpen(true);
                }}
              >
                <ListChecks size={12} />
                Edital
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  setSelectedSubjectForHistory && setSelectedSubjectForHistory(subject);
                  setIsSessionHistoryModalOpen && setIsSessionHistoryModalOpen(true);
                }}
              >
                <History size={12} />
                Histórico
              </button>
              <button
                className="btn btn-warning"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  setEditingSubject(subject);
                  setIsSubjectModalOpen(true);
                }}
              >
                <Edit size={12} />
                Editar
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => {
                  setConfirmationDialog({
                    isOpen: true,
                    title: 'Confirmar Exclusão',
                    message: `Tem certeza que deseja deletar a matéria "${subject.name}"? Todos os dados relacionados serão perdidos.`,
                    onConfirm: () => {
                      handleDeleteSubject(subject.id);
                      setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                    }
                  });
                }}
              >
                <Trash2 size={12} />
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
