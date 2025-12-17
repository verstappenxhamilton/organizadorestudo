import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sanitizeMultilineText, sanitizeText } from '../../utils/helpers';
import { sanitizeHexColor } from '../../utils/studyCycle';

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

        const name = sanitizeText(formData.name).slice(0, 80);
        if (!name) {
            showToast('Nome da matéria é obrigatório', 'warning');
            return;
        }

        const targetHours = Math.max(0, Math.min(10000, parseInt(formData.targetHours, 10) || 0));
        onSubmit({
            name,
            description: sanitizeMultilineText(formData.description).slice(0, 800),
            color: sanitizeHexColor(formData.color, '#3b82f6'),
            targetHours
        });
    };

    if (!isOpen) return null;

    return createPortal(
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
                        <div className="form-group mb-4">
                            <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                                Nome da Matéria <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Direito Constitucional"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group mb-6">
                            <label className="form-label text-sm font-semibold text-gray-300 mb-1 block">
                                Meta de Horas (opcional)
                            </label>
                            <input
                                type="number"
                                className="form-input w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                                value={formData.targetHours}
                                onChange={(e) => setFormData(prev => ({ ...prev, targetHours: parseInt(e.target.value) || 0 }))}
                                min="0"
                                placeholder="Ex: 50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Define um objetivo de horas totais para estudar esta matéria.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2 rounded text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-6 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!formData.name.trim()}
                            >
                                {editingSubject ? 'Salvar Alterações' : 'Salvar Matéria'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};
