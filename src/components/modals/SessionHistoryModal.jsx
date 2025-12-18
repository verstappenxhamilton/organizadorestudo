import React from 'react';
import { createPortal } from 'react-dom';

export const SessionHistoryModal = ({
    isOpen,
    onClose,
    selectedSubject,
    studySessions,
    setEditingSession,
    setIsSessionModalOpen,
    setConfirmationDialog,
    handleDeleteSession: deleteSessionAction
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

    const handleDeleteClick = (sessionId) => {
        setConfirmationDialog({
            isOpen: true,
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja deletar esta sessão de estudo?',
            onConfirm: () => {
                if (deleteSessionAction) {
                    deleteSessionAction(sessionId);
                }
                setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
            }
        });
    };

    return createPortal(
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

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-2xl font-bold text-white">{subjectSessions.length}</div>
                            <div className="text-xs text-slate-400 uppercase font-semibold">Total de Sessões</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-2xl font-bold text-blue-400">{totalTime.toFixed(1)}h</div>
                            <div className="text-xs text-slate-400 uppercase font-semibold">Tempo Total</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div className="text-2xl font-bold text-emerald-400">
                                {subjectSessions.length > 0 ? (totalTime / subjectSessions.length).toFixed(1) : 0}h
                            </div>
                            <div className="text-xs text-slate-400 uppercase font-semibold">Média por Sessão</div>
                        </div>
                    </div>

                    {/* Lista de Sessões */}
                    <div>
                        <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                           Sessões de Estudo
                        </h3>

                        {subjectSessions.length === 0 ? (
                            <div className="py-10 text-center text-slate-500 italic bg-slate-800/30 rounded-xl border border-slate-800">
                                Nenhuma sessão de estudo registrada para esta matéria.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subjectSessions.map(session => (
                                    <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <span className="text-slate-200 font-medium text-sm bg-slate-700/50 px-2 py-1 rounded">
                                                    {new Date(session.date).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-blue-400 font-bold text-sm flex items-center gap-1">
                                                    {(session.duration / 60).toFixed(1)}h
                                                </span>
                                                {Number.isFinite(session.accuracy) && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                                        session.accuracy >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        session.accuracy >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                        {session.accuracy}% acerto
                                                    </span>
                                                )}
                                                {session.studyType && (
                                                    <span className="text-[10px] uppercase tracking-wide font-bold text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">
                                                        {session.studyType === 'legislation' ? 'Lei Seca' :
                                                         session.studyType === 'questions' ? 'Questões' :
                                                         session.studyType === 'review' ? 'Revisão' : 'Teoria'}
                                                    </span>
                                                )}
                                            </div>
                                            {session.notes && (
                                                <div className="text-slate-400 text-sm italic truncate">
                                                    "{session.notes}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <button
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                                                onClick={() => handleEditSession(session)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                                                onClick={() => handleDeleteClick(session.id)}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 text-right bg-slate-900/50 rounded-b-xl">
                    <button
                        className="btn btn-secondary px-6"
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
