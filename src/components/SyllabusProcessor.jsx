import React, { useState } from 'react';
import { ClipboardPaste, Eye, Trash2, Edit3, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';

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
  const [isAddingManualItem, setIsAddingManualItem] = useState(false);
  const [manualItemName, setManualItemName] = useState('');

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

  const handleAddManualItem = () => {
    if (manualItemName.trim()) {
      onAddMultipleItems([manualItemName.trim()]);
      setManualItemName('');
      setIsAddingManualItem(false);
      showToast("Item adicionado com sucesso!", "success");
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
      <div className={`p-2.5 mb-2 border rounded-md shadow-sm transition-all duration-200 
        bg-slate-800 
        border-slate-700 
        hover:shadow-md hover:border-sky-500
        ${isSubItem ? 'ml-6 border-l-4 border-l-slate-600' : 'border-l-4 border-l-sky-500'}`}
      >
        <div className="flex justify-between items-start gap-2">
          <span className={`font-medium text-slate-200 flex-grow whitespace-pre-wrap break-words leading-snug py-0.5 ${!isSubItem ? 'text-sm' : 'text-xs'}`}>
            {item.name}
          </span>
          
          <div className="flex items-center gap-0.5 flex-shrink-0 bg-slate-900 p-0.5 rounded border border-slate-700">
            <button 
              onClick={() => onMoveItemUp(item)} 
              disabled={isFirst} 
              className="text-slate-400 hover:text-sky-400 p-1 rounded hover:bg-sky-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
              title="Mover para Cima"
            >
              <ChevronUp size={14}/>
            </button>
            <button 
              onClick={() => onMoveItemDown(item)} 
              disabled={isLast} 
              className="text-slate-400 hover:text-sky-400 p-1 rounded hover:bg-sky-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
              title="Mover para Baixo"
            >
              <ChevronDown size={14}/>
            </button>
            <div className="w-px h-3 bg-slate-600 mx-0.5"></div>
            <button 
              onClick={() => onEditItemName(item)} 
              title="Editar Nome" 
              className="text-amber-500 hover:text-amber-400 p-1 rounded hover:bg-amber-900/20 transition-colors"
            >
              <Edit3 size={14}/>
            </button>
            <button 
              onClick={() => onDeleteItem(item)} 
              title="Excluir Item" 
              className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Import/Paste Section - Collapsible */}
      <div className="border-b border-slate-700 pb-4 mb-4">
        <button
          onClick={() => setIsPasteAreaVisible(!isPasteAreaVisible)}
          className="flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors w-full justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-sky-500/50"
        >
          <span className="flex items-center">
            <ClipboardPaste size={16} className="mr-2" />
            Importar Texto do Edital
          </span>
          {isPasteAreaVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isPasteAreaVisible && (
          <div className="mt-3 bg-slate-800 p-4 rounded-lg border border-slate-700 animate-fadeIn">
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Cole o conteúdo aqui
            </label>
            <textarea
              value={pastedSyllabusText}
              onChange={(e) => setPastedSyllabusText(e.target.value)}
              placeholder="Cole os tópicos do edital aqui (ex: 1. Direito Constitucional...)"
              className="w-full h-32 p-3 text-sm border border-slate-600 rounded-md bg-slate-900 text-slate-200 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 mb-3"
            />
            <button
              onClick={handleProcessPastedSyllabus}
              className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors text-sm font-medium"
            >
              Processar Texto
            </button>

            {processedPastedItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-300">
                    {processedPastedItems.length} itens identificados
                  </span>
                  <button
                    onClick={() => {
                      onAddMultipleItems(processedPastedItems);
                      setProcessedPastedItems([]);
                      setPastedSyllabusText('');
                      showToast("Itens adicionados!", "success");
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-500 text-xs font-medium transition-colors"
                  >
                    Adicionar Todos
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 bg-slate-900 p-2 rounded border border-slate-700">
                  {processedPastedItems.map((item, index) => (
                    <div key={index} className="text-xs text-slate-400 border-b border-slate-800 last:border-0 pb-1 mb-1">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Add Item - Only visible if not pasting or handled in parent modal usually, 
          but here we allow inline add as well if needed, though parent handles it too. 
          The previous code had a toggle for this. keeping it simple. */}
      
      {/* Syllabus List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
            Itens Atuais ({syllabusItems.length})
          </h4>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {syllabusItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
              Nenhum item cadastrado. <br/> Adicione manualmente ou importe um texto.
            </div>
          ) : (
            syllabusItems.map((item, index) => (
              <div key={item.id}>
                {editingItemId === item.id ? (
                  <div className="p-3 mb-2 border border-sky-500 rounded-lg bg-slate-800">
                    <input
                      type="text"
                      value={editingItemNameValue}
                      onChange={(e) => setEditingItemNameValue(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-600 rounded bg-slate-900 text-slate-200 focus:border-sky-500 mb-2"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingItemId(null);
                          setEditingItemNameValue('');
                        }}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveItemName(item.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500"
                      >
                        Salvar
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

