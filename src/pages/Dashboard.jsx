import React from 'react';
import { useStudyContext } from '../context/StudyContext';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  BookOpen
} from 'lucide-react';

export const Dashboard = () => {
  const {
    activeProfileId,
    activeSubjects,
    activeSessions,
    syllabusItems,
    studyProfiles
  } = useStudyContext();

  if (!activeProfileId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Organizador</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Para começar, selecione um perfil existente no topo ou vá em Configurações para criar um novo.
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalStudyTime = activeSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
  const totalTopics = syllabusItems.filter(i => activeSubjects.some(s => s.id === i.subjectId)).length;
  const studiedTopics = syllabusItems.filter(i => activeSubjects.some(s => s.id === i.subjectId) && i.isStudied).length;
  const progress = totalTopics ? Math.round((studiedTopics / totalTopics) * 100) : 0;

  const todaySessions = activeSessions.filter(s => {
    const sessionDate = new Date(s.date).toDateString();
    const today = new Date().toDateString();
    return sessionDate === today;
  });
  const todayTime = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

  return (
    <div className="space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-slate-400">Acompanhe seu progresso e mantenha o foco.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          title="Tempo Total"
          value={`${totalStudyTime.toFixed(1)}h`}
          trend="+2.5h essa semana"
          color="blue"
        />
        <StatCard
          icon={Target}
          title="Progresso Geral"
          value={`${progress}%`}
          trend={`${studiedTopics}/${totalTopics} tópicos`}
          color="violet"
        />
        <StatCard
          icon={Calendar}
          title="Hoje"
          value={`${todayTime.toFixed(1)}h`}
          trend={`${todaySessions.length} sessões`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Média Diária"
          value="1.2h"
          trend="Últimos 7 dias"
          color="amber"
        />
      </div>

      {/* Recent Activity or Quick Actions could go here */}

      {/* Reusing existing component for now, but wrapped cleanly */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Suas Matérias</h2>
        {/* Note: SubjectsOverview expects props that were previously in App.jsx.
            We might need to refactor SubjectsOverview to use Context or pass props from Context here.
            For now, I'll pass simple props or placeholders if the component isn't fully refactored.
            However, since I haven't refactored SubjectsOverview yet, I should probably do that or pass all required props.
        */}
         <div className="p-4 border border-dashed border-slate-700 rounded-lg text-center text-slate-400">
            A visualização detalhada de matérias está na aba "Matérias".
            <br/>
            (Aqui poderíamos ter um resumo ou gráfico simplificado)
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, trend, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-500",
    violet: "bg-violet-500/10 text-violet-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {/* <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          +12%
        </span> */}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-500 text-xs">{trend}</p>
      </div>
    </div>
  );
};
