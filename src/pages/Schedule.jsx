import React from 'react';
import { useStudyContext } from '../context/StudyContext';
import { Calendar } from '../components/Calendar';

export const Schedule = () => {
  const { activeSessions, activeSyllabusItems, activeSubjects } = useStudyContext();

  return (
    <div className="animate-enter space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
        <p className="text-slate-400">Visualize seu histórico de sessões e revisões futuras.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1">
        <Calendar
          studySessions={activeSessions}
          syllabusItems={activeSyllabusItems}
          subjects={activeSubjects}
        />
      </div>
    </div>
  );
};
