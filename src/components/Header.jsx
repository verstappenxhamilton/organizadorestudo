import React from 'react';
import {
  Users,
  PlusCircle,
  BarChart3,
  Download,
  Upload,
  BookOpen,
  Sparkles,
  CalendarDays
} from 'lucide-react';

export const AppHeader = ({
  setIsProgressReportModalOpen,
  handleExportData,
  handleImportData,
  studyProfiles,
  activeProfileId,
  setActiveProfileId,
  onOpenProfileModal
}) => {
  const activeProfile = studyProfiles?.find(profile => profile.id === activeProfileId);
  const examDate = activeProfile?.examDate;
  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <header className="card relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sky-100/60">Organizador</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Painel de Estudos</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {activeProfile
                  ? `Foque no concurso ${activeProfile.name} e acompanhe o desempenho do seu ciclo de estudos em tempo real.`
                  : 'Crie um concurso para começar a organizar objetivos, cronogramas e revisões personalizadas.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sky-100">
              <Sparkles size={14} />
              {activeProfile?.institution || 'Personalize seu estudo'}
            </span>
            {examDate && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <CalendarDays size={14} />
                {daysUntilExam > 0
                  ? `${daysUntilExam} ${daysUntilExam === 1 ? 'dia' : 'dias'} para a prova`
                  : 'Prova em andamento'}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Users size={14} />
              {studyProfiles.length} {studyProfiles.length === 1 ? 'perfil' : 'perfis'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setIsProgressReportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/60 hover:bg-white/20"
            title="Relatório (Ctrl+R)"
          >
            <BarChart3 size={16} />
            Relatório
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
            title="Exportar dados"
          >
            <Download size={16} />
            Exportar
          </button>

          <label
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/60 hover:bg-sky-500/20"
            title="Importar dados"
          >
            <Upload size={16} />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportData(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Concurso ativo</span>
              {studyProfiles.length > 0 ? (
                <select
                  value={activeProfileId || ''}
                  onChange={(e) => setActiveProfileId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value="">Selecione um concurso</option>
                  {studyProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-2 text-sm text-slate-400">Nenhum concurso cadastrado ainda.</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProfileModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
        >
          <PlusCircle size={16} />
          Gerenciar concursos
        </button>
      </div>
    </header>
  );
};

