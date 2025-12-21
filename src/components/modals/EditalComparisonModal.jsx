import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getAvailableEditais } from '../../utils/editalManager';
import { mergeEditaisContent } from '../../utils/editalComparison';

const Chip = ({ label, variant = 'default' }) => {
  const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    unique: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    common: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  };

  return <span className={`${base} ${variants[variant] || variants.default}`}>{label}</span>;
};

export const EditalComparisonModal = ({ isOpen, onClose }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const availableEditais = useMemo(() => getAvailableEditais(), []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
    }
  }, [isOpen]);

  const selectedEditais = useMemo(
    () => availableEditais.filter((edital) => selectedIds.includes(edital.id)),
    [availableEditais, selectedIds]
  );

  const mergedContent = useMemo(
    () => mergeEditaisContent(selectedEditais),
    [selectedEditais]
  );

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <h2 className="flex items-center justify-between">
          Comparar Editais
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Selecione dois ou mais editais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableEditais.map((edital) => (
                <label
                  key={edital.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:border-sky-500/60 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(edital.id)}
                    onChange={() => toggleSelection(edital.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{edital.nome}</p>
                    <p className="text-xs text-slate-400">{edital.concurso || 'Edital global'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Chip label={edital.source === 'global' ? 'Global' : 'Personalizado'} />
                      {edital.arquivoPdf && (
                        <Chip label="PDF disponível" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {selectedEditais.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Resultado da sobreposição
                </h3>
                <Chip label={`Selecionados: ${selectedEditais.length}`} />
                <Chip label="Único" variant="unique" />
                <Chip label="Comum" variant="common" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">Matérias</h4>
                  <div className="space-y-2">
                    {mergedContent.materias.length === 0 && (
                      <p className="text-xs text-slate-500 italic">Nenhuma matéria encontrada.</p>
                    )}
                    {mergedContent.materias.map((materia) => (
                      <div
                        key={materia.key}
                        className="p-2 rounded-lg border border-slate-700 bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-200">{materia.label}</p>
                          <Chip
                            label={materia.isUnique ? 'Único' : materia.isCommon ? 'Comum' : 'Parcial'}
                            variant={materia.isUnique ? 'unique' : materia.isCommon ? 'common' : 'default'}
                          />
                        </div>
                        {materia.labels?.length > 1 && (
                          <p className="text-xs text-slate-400 mt-2">
                            Variações: {materia.labels.join(' • ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">Tópicos</h4>
                  <div className="space-y-2">
                    {mergedContent.topicos.length === 0 && (
                      <p className="text-xs text-slate-500 italic">Nenhum tópico encontrado.</p>
                    )}
                    {mergedContent.topicos.map((topico) => (
                      <div
                        key={topico.key}
                        className="p-2 rounded-lg border border-slate-700 bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-200">{topico.label}</p>
                          <Chip
                            label={topico.isUnique ? 'Único' : topico.isCommon ? 'Comum' : 'Parcial'}
                            variant={topico.isUnique ? 'unique' : topico.isCommon ? 'common' : 'default'}
                          />
                        </div>
                        {topico.labels?.length > 1 && (
                          <p className="text-xs text-slate-400 mt-2">
                            Variações: {topico.labels.join(' • ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
