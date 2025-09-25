import React from 'react';

export default function GlobalConcursosCard({ concursos, syllabusItems, onImport }) {
  if (!concursos || concursos.length === 0) return null;

  return (
    <div className="card space-y-4 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-slate-300">Biblioteca global</span>
          <h2 className="mt-1 text-xl font-semibold text-white">Concursos sugeridos</h2>
          <p className="mt-2 text-sm text-slate-400">
            Importe rapidamente editais completos estruturados por especialistas.
          </p>
        </div>
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
          {concursos.length} disponíveis
        </span>
      </div>

      <div className="space-y-3">
        {concursos.map(concurso => {
          const totalSubtopicos = (concurso.materias || []).reduce(
            (acc, materia) =>
              acc + (materia.submaterias || []).reduce(
                (subAcc, submateria) => subAcc + (submateria.subtopicos || []).length,
                0
              ),
            0
          );
          const importedCount = syllabusItems.filter(item => item.concursoId === concurso.id).length;
          const progress = totalSubtopicos > 0 ? ((importedCount / totalSubtopicos) * 100).toFixed(1) : '0';

          return (
            <div
              key={concurso.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-sky-400/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{concurso.nome}</p>
                  {concurso.banca && <p className="text-xs text-slate-400">Banca: {concurso.banca}</p>}
                  {concurso.orgao && <p className="text-xs text-slate-500">{concurso.orgao}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onImport(concurso.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Importar
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                <div className="h-2 flex-1 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-semibold text-slate-200">{progress}%</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {importedCount}/{totalSubtopicos} subtópicos importados
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
