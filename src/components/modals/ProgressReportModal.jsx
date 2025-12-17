import React from 'react';
import { createPortal } from 'react-dom';

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
    const studiedSyllabusItems = syllabusItems.filter(item => item.isStudied).length;
    const averageAccuracy = syllabusItems.length > 0
        ? syllabusItems.reduce((sum, item) => sum + (item.accuracy || 0), 0) / syllabusItems.length
        : 0;

    return createPortal(
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }}>
            <div className="modal large" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <h2>
                    Relatório de Progresso
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </h2>

                <div className="p-6 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Estatísticas Gerais */}
                    <div className="stats-grid" style={{
                        marginBottom: '30px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '16px'
                    }}>
                        <div className="stat-card">
                            <div className="stat-value">{totalStudyTime.toFixed(1)}h</div>
                            <div className="stat-label">Total Horas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{studiedSyllabusItems}</div>
                            <div className="stat-label">Itens Estudados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{averageAccuracy.toFixed(1)}%</div>
                            <div className="stat-label">Média de Acertos</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{studySessions.length}</div>
                            <div className="stat-label">Sessões</div>
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
        </div>,
        document.body
    );
};
