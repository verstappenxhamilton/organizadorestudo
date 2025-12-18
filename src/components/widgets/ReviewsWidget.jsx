import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ReviewsWidget = ({ syllabusItems, subjects, onReviewClick }) => {
  const today = new Date().toISOString().split('T')[0];

  // Filter items that need review
  const reviewsDue = syllabusItems
    .filter(item => {
      // Must be studied, have a nextReviewDate, and that date must be <= today
      return item.isStudied && item.nextReviewDate && item.nextReviewDate <= today;
    })
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)); // Oldest first

  if (reviewsDue.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 size={24} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Tudo em dia!</h3>
        <p className="text-slate-400 text-sm">Você não tem revisões pendentes para hoje.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-amber-400" />
          Revisões Pendentes
        </h2>
        <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded-md border border-amber-500/20">
          {reviewsDue.length}
        </span>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2 space-y-3">
        {reviewsDue.map(item => {
          const subject = subjects.find(s => s.id === item.subjectId);
          const isOverdue = item.nextReviewDate < today;

          return (
            <div
              key={item.id}
              className="group bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 rounded-xl p-3 transition-all cursor-pointer hover:bg-slate-800"
              onClick={() => onReviewClick(item)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {subject?.name || 'Matéria desconhecida'}
                </span>
                {isOverdue && (
                  <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                    <AlertCircle size={10} />
                    Atrasado
                  </div>
                )}
              </div>

              <h4 className="text-slate-200 font-medium text-sm mb-2 group-hover:text-white transition-colors">
                {item.name}
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Venceu: {new Date(item.nextReviewDate).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
