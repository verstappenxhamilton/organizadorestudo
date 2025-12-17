import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { SyllabusProcessor } from '../SyllabusProcessor';
import { sanitizeText } from '../../utils/helpers';
import { saveToLocalStorage } from '../../utils/localStorage';

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
        const name = sanitizeText(newItemName).slice(0, 220);
        if (!name) {
            showToast('Nome do item é obrigatório', 'warning');
            return;
        }

        const newItem = {
            id: Date.now().toString(),
            subjectId: currentSubjectForSyllabus.id,
            name,
            isStudied: false,
            createdAt: new Date().toISOString()
        };

        const updatedItems = [...syllabusItems, newItem];
        setSyllabusItems(updatedItems);
        saveToLocalStorage('syllabusItems', updatedItems);
        setNewItemName('');
        showToast('Item adicionado com sucesso!', 'success');
    };

    const handleAddMultipleItems = (items) => {
        const cleaned = (Array.isArray(items) ? items : [])
            .map((itemName) => sanitizeText(itemName).slice(0, 220))
            .filter(Boolean);

        if (cleaned.length === 0) return;

        const newItems = cleaned.map((itemName, index) => ({
            id: (Date.now() + index).toString(),
            subjectId: currentSubjectForSyllabus.id,
            name: itemName,
            isStudied: false,
            createdAt: new Date().toISOString()
        }));

        const updatedItems = [...syllabusItems, ...newItems];
        setSyllabusItems(updatedItems);
        saveToLocalStorage('syllabusItems', updatedItems);
    };

    const handleQuickAddBelow = (anchorItem) => {
        const newName = window.prompt(`Digite o novo topico ou subtopico para adicionar abaixo de "${anchorItem.name}":`);
        const name = sanitizeText(newName || '').slice(0, 220);
        if (!name) {
            showToast('Nome do item e obrigatorio', 'warning');
            return;
        }

        const anchorIndex = syllabusItems.findIndex(item => item.id === anchorItem.id);
        if (anchorIndex === -1) return;

        const newItem = {
            id: `${Date.now()}`,
            subjectId: currentSubjectForSyllabus.id,
            name,
            isStudied: false,
            createdAt: new Date().toISOString()
        };

        const updatedItems = [...syllabusItems];
        updatedItems.splice(anchorIndex + 1, 0, newItem);
        setSyllabusItems(updatedItems);
        saveToLocalStorage('syllabusItems', updatedItems);
        showToast('Item adicionado logo abaixo.', 'success');
    };

    const handleUpdateItemName = (itemId, oldName, newName) => {
        const cleaned = sanitizeText(newName).slice(0, 220);
        if (!cleaned) {
            showToast('Nome do item é obrigatório', 'warning');
            return;
        }
        const updatedItems = syllabusItems.map(item =>
            item.id === itemId ? { ...item, name: cleaned } : item
        );
        setSyllabusItems(updatedItems);
        saveToLocalStorage('syllabusItems', updatedItems);
        showToast('Item atualizado com sucesso!', 'success');
    };

    const handleDeleteItem = (item) => {
        const updatedItems = syllabusItems.filter(i => i.id !== item.id);
        setSyllabusItems(updatedItems);
        saveToLocalStorage('syllabusItems', updatedItems);
        showToast('Item removido com sucesso!', 'success');
    };

    const handleMoveItemUp = (item) => {
        const currentIndex = syllabusItems.findIndex(i => i.id === item.id);
        if (currentIndex === -1) return;

        // Find the previous item with the same subjectId
        let targetIndex = -1;
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (syllabusItems[i].subjectId === item.subjectId) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex !== -1) {
            const newItems = [...syllabusItems];
            [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
            setSyllabusItems(newItems);
            saveToLocalStorage('syllabusItems', newItems);
        }
    };

    const handleMoveItemDown = (item) => {
        const currentIndex = syllabusItems.findIndex(i => i.id === item.id);
        if (currentIndex === -1) return;

        // Find the next item with the same subjectId
        let targetIndex = -1;
        for (let i = currentIndex + 1; i < syllabusItems.length; i++) {
            if (syllabusItems[i].subjectId === item.subjectId) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex !== -1) {
            const newItems = [...syllabusItems];
            [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
            setSyllabusItems(newItems);
            saveToLocalStorage('syllabusItems', newItems);
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
            <div className="modal large syllabus-modal" onClick={(e) => e.stopPropagation()}>
                <h2>
                    Gerenciar Edital - {currentSubjectForSyllabus.name}
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </h2>

                <div className="syllabus-content custom-scrollbar">
                    <div className="syllabus-manager-container">
                        {/* Section: Add New Item */}
                        <div className="add-item-card">
                            <h3 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px', marginTop: 0 }}>
                                Adicionar novo tópico
                            </h3>
                            <div className="add-item-input-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ flex: 1 }}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Digite o nome do tópico ou subtópico..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleAddItem();
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddItem}
                                    disabled={!newItemName.trim()}
                                >
                                    <PlusCircle size={16} />
                                    Adicionar
                                </button>
                            </div>
                        </div>

                        {/* Section: List Items */}
                        <div className="items-list-container">
                            <SyllabusProcessor
                                onAddMultipleItems={handleAddMultipleItems}
                                showToast={showToast}
                                syllabusItems={subjectItems}
                                onUpdateItemName={handleUpdateItemName}
                                onDeleteItem={handleDeleteItem}
                                onMoveItemUp={handleMoveItemUp}
                                onMoveItemDown={handleMoveItemDown}
                                onQuickAddBelow={handleQuickAddBelow}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
