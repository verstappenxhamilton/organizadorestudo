import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { mergeEditais } from '../../utils/editalComparison';

export const EditalComparisonModal = ({ isOpen, onClose, editais }) => {
  const merged = useMemo(() => mergeEditais(editais), [editais]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <h2>
          Comparativo de Editais
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </h2>
        <div className="modal-content-scroll">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-sm text-slate-300">
                {merged.totalEditais} edital(is) selecionado(s). Itens marcados como{' '}
                <span className="text-amber-300 font-semibold">Exclusivo</span> aparecem apenas em um edital.
              </p>
            </div>

            {merged.subjects.length === 0 ? (
              <p className="text-slate-400">Nenhum conteúdo para comparar.</p>
            ) : (
              <div className="space-y-4">
                {merged.subjects.map((subject) => (
                  <div key={subject.key} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-white">{subject.name}</h3>
                      {merged.totalEditais > 1 && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                            subject.count === 1
                              ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                              : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          {subject.count === 1 ? 'Exclusivo' : `${subject.count}/${subject.totalEditais}`}
                        </span>
                      )}
                    </div>

                    {subject.topics.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {subject.topics.map((topic) => (
                          <li
                            key={topic.key}
                            className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                              merged.totalEditais > 1 && topic.count === 1
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-100'
                                : 'border-slate-800 bg-slate-900/40 text-slate-200'
                            }`}
                          >
                            <span className="flex-1">{topic.name}</span>
                            {merged.totalEditais > 1 && (
                              <span
                                className={`text-xs font-semibold ${
                                  topic.count === 1 ? 'text-amber-300' : 'text-emerald-300'
                                }`}
                              >
                                {topic.count === 1 ? 'Exclusivo' : `${topic.count}/${topic.totalEditais}`}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">Nenhum tópico informado neste edital.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
