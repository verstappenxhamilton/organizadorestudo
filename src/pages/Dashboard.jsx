import React from 'react';
import { useStudyContext } from '../context/StudyContext';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-enter">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/50">
          <BookOpen size={40} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Organizador</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Para começar, selecione um perfil existente no topo ou vá em Configurações para criar um novo.
        </p>
        <Link to="/settings" className="btn btn-primary">
          Ir para Configurações
        </Link>
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

  // Recent Activity (Top 5 sessions)
  const recentSessions = [...activeSessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Top Subjects by Time
  const topSubjects = [...activeSubjects]
    .map(s => ({
        ...s,
        hours: activeSessions
            .filter(session => session.subjectId === s.id)
            .reduce((acc, session) => acc + (session.duration || 0), 0) / 60
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 4);

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
          trend="Horas acumuladas"
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
          title="Matérias Ativas"
          value={activeSubjects.length}
          trend="No ciclo atual"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Subjects Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Matérias Principais</h2>
                <Link to="/subjects" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Ver todas <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                {topSubjects.length > 0 ? (
                    topSubjects.map(s => (
                        <div key={s.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300 font-medium">{s.name}</span>
                                <span className="text-slate-400 text-sm">{s.hours.toFixed(1)}h</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(s.hours / (totalStudyTime || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-sm">Nenhuma matéria estudada ainda.</p>
                )}
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Atividade Recente</h2>
                <Link to="/schedule" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Ver agenda <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                {recentSessions.length > 0 ? (
                    recentSessions.map(session => {
                        const subject = activeSubjects.find(s => s.id === session.subjectId);
                        const topic = syllabusItems.find(t => t.id === session.syllabusItemId);
                        return (
                            <div key={session.id} className="flex items-start gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <h4 className="text-slate-200 font-medium">{subject?.name || 'Matéria desconhecida'}</h4>
                                    <p className="text-slate-400 text-sm">
                                        {topic ? topic.name : 'Estudo geral'} • {(session.duration / 60).toFixed(1)}h
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {new Date(session.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-slate-500 text-sm">Nenhuma sessão registrada recentemente.</p>
                )}
            </div>
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
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-slate-500 text-xs">{trend}</p>
      </div>
    </div>
  );
};
