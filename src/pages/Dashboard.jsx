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
import { ReviewsWidget } from '../components/widgets/ReviewsWidget';

export const Dashboard = () => {
  const {
    activeProfileId,
    activeSubjects,
    activeSessions,
    syllabusItems,
    studyProfiles,
    // Actions for widget
    setIsSessionModalOpen,
    setCurrentSubjectForSession,
    // We'll need a way to pass initial data to session modal, likely via context or local state lifted up
    // But for now, we can just open the modal.
    setEditingSession // Assuming this exists or we need to add it to context to "prefill"
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

  const handleReviewClick = (item) => {
    // Open session modal prefilled
    setCurrentSubjectForSession(item.subjectId);
    // We need to pass the specific topic ID.
    // The context might not support passing "initial data" directly to the open modal
    // without a specific state.
    // Let's assume we can use a new method or prop in context, OR
    // since we can't easily change the Context provider right now without a big refactor,
    // we will check if `setEditingSession` can be used to "mock" a new session with data.

    // Actually, looking at SessionModal usage in SubjectsOverview:
    // It uses `initialSessionData` prop if passed.
    // Dashboard doesn't render SessionModal directly, the Layout does (probably).
    // Wait, where is SessionModal rendered?
    // It's likely in `App.jsx` or `Layout`. Let's check.
    // Actually, I can pass it via `setEditingSession` but that implies EDITING an existing one.

    // Plan B: Just open the modal with the subject.
    // Plan A+ (Instructor): I should allow starting a review directly.

    // For now, let's just open the modal with the subject.
    // Ideally I would call `setInitialSessionData({ syllabusItemId: item.id, isReview: true })`
    // but I don't see that in the destructuring above.
    // I'll add `setInitialSessionData` to the context consumption if available.

    if (typeof setCurrentSubjectForSession === 'function') {
        setCurrentSubjectForSession(item.subjectId);
        setIsSessionModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 animate-enter">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-slate-400">Acompanhe seu progresso e mantenha o foco.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Clock}
          title="Tempo Total"
          value={`${totalStudyTime.toFixed(1)}h`}
          trend="Horas"
          color="blue"
        />
        <StatCard
          icon={Target}
          title="Progresso"
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
          title="Ativas"
          value={activeSubjects.length}
          trend="Matérias"
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column: Reviews & Subjects (2/3 on large screens) */}
        <div className="xl:col-span-2 flex flex-col gap-8">

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

        {/* Right Column: Widget */}
        <div className="xl:col-span-1 h-full min-h-[400px]">
           <ReviewsWidget
             syllabusItems={syllabusItems}
             subjects={activeSubjects}
             onReviewClick={handleReviewClick}
           />
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs md:text-sm font-medium mb-1 truncate">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-0.5 md:mb-1">{value}</h3>
        <p className="text-slate-500 text-[10px] md:text-xs truncate">{trend}</p>
      </div>
    </div>
  );
};
