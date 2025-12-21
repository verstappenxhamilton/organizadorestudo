import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sanitizeMultilineText, sanitizeText } from '../../utils/helpers';
import { getAvailableEditais } from '../../utils/editalManager';

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
        institution: '',
        editalId: ''
    });
    const [availableEditais, setAvailableEditais] = useState([]);

    useEffect(() => {
        setAvailableEditais(getAvailableEditais());

        if (editingProfile) {
            setFormData({
                name: editingProfile.name || '',
                description: editingProfile.description || '',
                examDate: editingProfile.examDate || '',
                institution: editingProfile.institution || '',
                editalId: editingProfile.editalId || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                examDate: '',
                institution: '',
                editalId: ''
            });
        }
    }, [editingProfile]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const name = sanitizeText(formData.name).slice(0, 80);
        if (!name) {
            showToast('Nome do perfil é obrigatório', 'warning');
            return;
        }

        const selectedEdital = availableEditais.find((edital) => edital.id === formData.editalId);

        onSubmit({
            name,
            description: sanitizeMultilineText(formData.description).slice(0, 500),
            examDate: sanitizeText(formData.examDate).slice(0, 20),
            institution: sanitizeText(formData.institution).slice(0, 120),
            editalId: formData.editalId || '',
            editalNome: selectedEdital?.nome || ''
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

                        <div className="form-group">
                            <label className="form-label">Edital Global (opcional)</label>
                            <select
                                className="form-input"
                                value={formData.editalId}
                                onChange={(e) => setFormData(prev => ({ ...prev, editalId: e.target.value }))}
                            >
                                <option value="">Não selecionar edital</option>
                                {availableEditais.map((edital) => (
                                    <option key={edital.id} value={edital.id}>
                                        {edital.nome}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Selecione um edital global para importar matérias e comparar conteúdos.
                            </p>
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
        </div>,
        document.body
    );
};
