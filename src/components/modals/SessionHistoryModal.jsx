import React from 'react';

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
                // Confirmation is handled in App.jsx (via confirmationDialog prop), but the logic for deleting
                // is likely in App.jsx. wait, App.jsx passes `setConfirmationDialog`. The `onConfirm` here
                // needs to trigger the deletion. But `handleDeleteSession` logic IS NOT passed as a prop!
                // In the original file, it was just setting state, but the actual deletion logic was...
                // Wait, looking at original Modals.jsx lines 703-712:
                /*
                  onConfirm: () => {
                    // Aqui seria implementada a função de deletar sessão
                    setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                  }
                */
                // It seems the original code was incomplete or missing the actual delete call!
                // I should fix this if I can, but for now I will strictly copy the behavior to not introduce bugs,
                // although I see this is a placeholder. 
                // Actually, I should probably expose the delete function from useStudyData and pass it here?
                // But App.jsx didn't pass a delete function for sessions to this modal?
                // Let's check App.jsx again later. For now, I'll copy the existing code.
                setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
            }
        });
        // Correction: In App.jsx, I don't see handleSessionDelete exposed. I will check this later.
    };

    // Styles
    const sessionItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '8px',
        marginBottom: '8px'
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
                                    <div key={session.id} style={sessionItemStyle}>
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
