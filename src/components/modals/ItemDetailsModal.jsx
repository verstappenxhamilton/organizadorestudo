import React from 'react';

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
    const studyOnlySessions = itemSessions.filter((session) => (session.duration || 0) > 0);

    const statsContainerStyle = {
        marginBottom: '24px'
    };

    const sectionTitleStyle = {
        color: '#e2e8f0',
        marginBottom: '12px',
        fontSize: '1.1rem'
    };

    const emptyStateStyle = {
        padding: '16px',
        background: 'rgba(71, 85, 105, 0.2)',
        borderRadius: '8px',
        color: '#94a3b8',
        textAlign: 'center'
    };

    const listContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const listItemStyle = {
        padding: '12px 16px',
        background: 'rgba(71, 85, 105, 0.2)',
        borderRadius: '8px',
        color: '#e2e8f0'
    };

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
                    <div style={statsContainerStyle}>
                        <h3 style={sectionTitleStyle}>
                            Histórico de Estudos:
                        </h3>

                        {studyOnlySessions.length === 0 ? (
                            <div style={emptyStateStyle}>
                                Nenhuma sessão de estudo registrada para este item.
                            </div>
                        ) : (
                            <div style={listContainerStyle}>
                                {studyOnlySessions.map(session => (
                                    <div
                                        key={session.id}
                                        style={listItemStyle}
                                    >
                                        Estudado em {new Date(session.date).toLocaleDateString('pt-BR')} ({((session.duration || 0) / 60).toFixed(1)}h)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Histórico de Acertos */}
                    <div style={statsContainerStyle}>
                        <h3 style={sectionTitleStyle}>
                            Histórico de Acertos:
                        </h3>

                        {itemSessions.filter((s) => Number.isFinite(s.accuracy)).length === 0 ? (
                            <div style={emptyStateStyle}>
                                Nenhum registro de acertos para este item.
                            </div>
                        ) : (
                            <div style={listContainerStyle}>
                                {itemSessions
                                    .filter((session) => Number.isFinite(session.accuracy))
                                    .map(session => (
                                        <div
                                            key={session.id}
                                            style={listItemStyle}
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
