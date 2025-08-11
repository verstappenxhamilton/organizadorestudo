import React, { useState } from 'react';
import { ClipboardPaste, Eye, Trash2, Edit3, ChevronUp, ChevronDown } from 'lucide-react';

export const SyllabusProcessor = ({ 
  onAddMultipleItems, 
  showToast,
  syllabusItems,
  onUpdateItemName,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown
}) => {
  const [pastedSyllabusText, setPastedSyllabusText] = useState('');
  const [processedPastedItems, setProcessedPastedItems] = useState([]);
  const [isPasteAreaVisible, setIsPasteAreaVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemNameValue, setEditingItemNameValue] = useState('');

  const handleProcessPastedSyllabus = () => {
    if (!pastedSyllabusText.trim()) {
      showToast("Nenhum texto para processar.", "info");
      return;
    }

    const text = pastedSyllabusText.trim();
    const parsedItemsOutput = [];

    const subjectMatch = text.match(/^([A-ZÁÊÇÕ\s]+):\s*/);
    let processText = text;
    
    if (subjectMatch) {
      processText = text.substring(subjectMatch[0].length);
    }

    const processItems = () => {
      const segments = processText.split(/(?:\.\s+(?=\d+\s)|\n)/);
      
      segments.forEach(segment => {
        segment = segment.trim();
        if (!segment) return;

        const mainItemMatch = segment.match(/^(\d+)\s+(.+)/);
        if (mainItemMatch) {
          const [, number, content] = mainItemMatch;
          parsedItemsOutput.push(`${number}. ${content.trim()}`);
          return;
        }

        const subItemMatch = segment.match(/^(\d+\.\d+)\.?\s+(.+)/);
        if (subItemMatch) {
          const [, number, content] = subItemMatch;
          parsedItemsOutput.push(`${number}. ${content.trim()}`);
          return;
        }

        const subSubItemMatch = segment.match(/^(\d+\.\d+\.\d+)\.?\s+(.+)/);
        if (subSubItemMatch) {
          const [, number, content] = subSubItemMatch;
          parsedItemsOutput.push(`${number}. ${content.trim()}`);
          return;
        }

        const anyNumberMatch = segment.match(/^(\d+(?:\.\d+)*\.?)\s+(.+)/);
        if (anyNumberMatch) {
          const [, number, content] = anyNumberMatch;
          const cleanNumber = number.replace(/\.$/, '');
          parsedItemsOutput.push(`${cleanNumber}. ${content.trim()}`);
        }
      });
    };

    processItems();

    const filteredItems = parsedItemsOutput.filter(item => item.trim().length > 0);
    setProcessedPastedItems(filteredItems);
    showToast(`${filteredItems.length} item(ns) processado(s). Revise e adicione.`, "info");
  };

  const handleEditItemNameClick = (item) => {
    setEditingItemId(item.id);
    setEditingItemNameValue(item.name);
  };

  const handleSaveItemName = (itemId) => {
    if (editingItemNameValue.trim()) {
      const oldItem = syllabusItems.find(i => i.id === itemId);
      onUpdateItemName(itemId, oldItem?.name, editingItemNameValue);
      setEditingItemId(null);
      setEditingItemNameValue('');
    } else {
      showToast("O nome do item não pode ser vazio.", "error");
    }
  };

  const SyllabusItemDisplay = ({ item, onEditItemName, onDeleteItem, onMoveItemUp, onMoveItemDown, isFirst, isLast }) => {
    const isSubItem = item.name && typeof item.name === 'string' && (
      item.name.startsWith(" - ") || 
      /^\d+\.\d+/.test(item.name.trim())
    );
    
    return (
      <div className={`p-3.5 mb-2.5 border bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow ${isSubItem ? 'ml-4 sm:ml-6' : ''}`}>
        <div className="flex justify-between items-center">
          <span className={`font-medium text-slate-700 dark:text-slate-200 flex-grow whitespace-pre-wrap ${!isSubItem ? 'font-semibold text-base' : 'text-sm'}`}>
            {item.name}
          </span>
          <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
            <button onClick={() => onMoveItemUp(item)} disabled={isFirst} className="text-slate-400 hover:text-sky-400 p-1 disabled:opacity-50 disabled:cursor-not-allowed" title="Mover para Cima">
              <ChevronUp size={16}/>
            </button>
            <button onClick={() => onMoveItemDown(item)} disabled={isLast} className="text-slate-400 hover:text-sky-400 p-1 disabled:opacity-50 disabled:cursor-not-allowed" title="Mover para Baixo">
              <ChevronDown size={16}/>
            </button>
            <button onClick={() => onEditItemName(item)} title="Editar Nome" className="text-yellow-500 hover:text-yellow-600 p-1.5 rounded-md hover:bg-yellow-500/10 transition-colors">
              <Edit3 size={18}/>
            </button>
            <button onClick={() => onDeleteItem(item)} title="Excluir Item" className="text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-500/10 transition-colors">
              <Trash2 size={18}/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          onClick={() => setIsPasteAreaVisible(!isPasteAreaVisible)}
          className="flex items-center text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 mb-3"
        >
          <ClipboardPaste size={16} className="mr-2" />
          {isPasteAreaVisible ? 'Ocultar' : 'Mostrar'} Processador de Edital Colado
        </button>

        {isPasteAreaVisible && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cole o Edital Aqui para Processamento Rápido
            </label>
            <textarea
              value={pastedSyllabusText}
              onChange={(e) => setPastedSyllabusText(e.target.value)}
              placeholder="Cole o conteúdo do edital aqui. O sistema tentará identificar tópicos e subtópicos automaticamente."
              className="w-full h-32 p-3 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              onClick={handleProcessPastedSyllabus}
              className="mt-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
            >
              Processar Edital Colado
            </button>

            {processedPastedItems.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Itens Processados ({processedPastedItems.length})
                  </h4>
                  <button
                    onClick={() => {
                      onAddMultipleItems(processedPastedItems);
                      setProcessedPastedItems([]);
                      setPastedSyllabusText('');
                      showToast("Itens adicionados com sucesso!", "success");
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                  >
                    Adicionar Todos
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                  {processedPastedItems.map((item, index) => {
                    const isSubItem = /^\d+\.\d+/.test(item.trim());
                    return (
                      <div
                        key={index}
                        className={`p-2 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded ${isSubItem ? 'ml-4 text-slate-600 dark:text-slate-400' : 'font-medium'}`}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {syllabusItems && syllabusItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Itens do Edital ({syllabusItems.length})
          </h4>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {syllabusItems.map((item, index) => (
              <div key={item.id}>
                {editingItemId === item.id ? (
                  <div className="p-3 mb-2 border border-sky-300 dark:border-sky-600 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                    <input
                      type="text"
                      value={editingItemNameValue}
                      onChange={(e) => setEditingItemNameValue(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveItemName(item.id);
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => handleSaveItemName(item.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingItemId(null);
                          setEditingItemNameValue('');
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <SyllabusItemDisplay
                    item={item}
                    onEditItemName={handleEditItemNameClick}
                    onDeleteItem={onDeleteItem}
                    onMoveItemUp={onMoveItemUp}
                    onMoveItemDown={onMoveItemDown}
                    isFirst={index === 0}
                    isLast={index === syllabusItems.length - 1}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
