import React, { useMemo, useState } from 'react';
import {
  CalendarRange,
  Repeat,
  BarChart3,
  Brain,
  ListChecks,
  Map,
  ClipboardEdit,
  Sparkles
} from 'lucide-react';

const FEATURE_TABS = [
  {
    id: 'ciclo',
    label: 'Ciclo de estudos',
    icon: Repeat,
    headline: 'Planejamento personalizado e flexível',
    description:
      'Distribua as horas de estudo automaticamente ao longo da semana, equilibrando novos conteúdos, revisões e descanso de forma sustentável.',
    bullets: [
      'Monte blocos automáticos com base nas disciplinas e metas semanais.',
      'Receba sugestões de ajuste quando uma meta diária não for cumprida.',
      'Equilibre revisões estratégicas com novos conteúdos sem esforço manual.'
    ],
    activeClasses:
      'border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]',
    chipClasses: 'bg-sky-500/15 text-sky-100'
  },
  {
    id: 'revisoes',
    label: 'Revisões',
    icon: Brain,
    headline: 'Agenda inteligente de revisões',
    description:
      'Aplique princípios de repetição espaçada com lembretes automáticos para não perder conteúdo. Ajuste intervalos conforme evolução em cada tópico.',
    bullets: [
      'Organize revisões em múltiplas janelas (1, 3, 5, 7 dias e além).',
      'Receba alertas sobre conteúdos atrasados diretamente no painel.',
      'Ajuste manualmente o próximo ciclo quando dominar um tópico ou precisar reforço.'
    ],
    activeClasses:
      'border-amber-400/40 bg-amber-400/15 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]',
    chipClasses: 'bg-amber-400/20 text-amber-100'
  },
  {
    id: 'registro',
    label: 'Registro de estudos',
    icon: ClipboardEdit,
    headline: 'Registro completo de sessões',
    description:
      'Controle quanto tempo, páginas e aulas dedicou a cada disciplina. Classifique o formato de estudo e transforme seus registros em indicadores confiáveis.',
    bullets: [
      'Cronômetro integrado para medir o tempo real de cada sessão.',
      'Classifique por disciplina, tipo de material e objetivo da sessão.',
      'Registros alimentam automaticamente estatísticas e revisões.'
    ],
    activeClasses:
      'border-emerald-400/40 bg-emerald-400/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]',
    chipClasses: 'bg-emerald-400/20 text-emerald-100'
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    icon: BarChart3,
    headline: 'Estatísticas e indicadores acionáveis',
    description:
      'Visualize evolução semanal, distribuição de horas e taxas de acerto para adaptar o planejamento com base em dados reais.',
    bullets: [
      'Gráficos de consistência por disciplina e período.',
      'Indicadores de produtividade, acerto em simulados e dificuldade média.',
      'Insights automáticos quando houver queda de desempenho.'
    ],
    activeClasses:
      'border-violet-400/40 bg-violet-400/15 text-violet-100 shadow-[0_0_0_1px_rgba(167,139,250,0.35)]',
    chipClasses: 'bg-violet-400/20 text-violet-100'
  },
  {
    id: 'mapa',
    label: 'Mapa de dificuldades',
    icon: Map,
    headline: 'Mapeie facilidades e dificuldades',
    description:
      'Classifique tópicos como dominados, estudados ou pendentes para concentrar energia no que realmente precisa de reforço.',
    bullets: [
      'Visualize rapidamente tópicos críticos e pontos fortes.',
      'Ajuste a frequência de revisões conforme o status de cada item.',
      'Crie planos de reforço para assuntos com baixo desempenho.'
    ],
    activeClasses:
      'border-rose-400/40 bg-rose-400/15 text-rose-100 shadow-[0_0_0_1px_rgba(251,113,133,0.35)]',
    chipClasses: 'bg-rose-400/20 text-rose-100'
  },
  {
    id: 'edital',
    label: 'Edital verticalizado',
    icon: ListChecks,
    headline: 'Controle total do edital',
    description:
      'Navegue por todos os tópicos do edital em formato hierárquico, marque o que já foi estudado e acompanhe o progresso em tempo real.',
    bullets: [
      'Importe editais completos e acompanhe o percentual concluído.',
      'Marque subitens e gere mapa visual de cobertura.',
      'Conecte cada tópico a sessões, revisões e simulados.'
    ],
    activeClasses:
      'border-cyan-400/40 bg-cyan-400/15 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]',
    chipClasses: 'bg-cyan-400/20 text-cyan-100'
  }
];

const getStartOfWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatStatLabel = (value, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${value}${suffix}`;
};

export const ProductHighlights = ({ subjects = [], studySessions = [], syllabusItems = [] }) => {
  const [activeTabId, setActiveTabId] = useState('ciclo');
  const activeTab = FEATURE_TABS.find((tab) => tab.id === activeTabId) ?? FEATURE_TABS[0];

  const totals = useMemo(() => {
    const totalMinutes = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalHours = +(totalMinutes / 60).toFixed(1);

    const sessionsThisWeek = (() => {
      const startOfWeek = getStartOfWeek();
      return studySessions.filter((session) => {
        const sessionDate = normalizeDate(session.date || session.startTime);
        return sessionDate && sessionDate >= startOfWeek;
      }).length;
    })();

    const minutesThisWeek = (() => {
      const startOfWeek = getStartOfWeek();
      const minutes = studySessions.reduce((sum, session) => {
        const sessionDate = normalizeDate(session.date || session.startTime);
        if (sessionDate && sessionDate >= startOfWeek) {
          return sum + (session.duration || 0);
        }
        return sum;
      }, 0);
      return +(minutes / 60).toFixed(1);
    })();

    const accuracyValues = syllabusItems
      .map((item) => item.accuracy)
      .filter((value) => value !== undefined && value !== null);
    const avgAccuracy = accuracyValues.length
      ? Math.round(accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length)
      : null;

    const reviewedItems = syllabusItems.filter((item) => item.nextReviewDate);
    const today = normalizeDate(new Date());
    const overdueReviews = reviewedItems.filter((item) => {
      const reviewDate = normalizeDate(item.nextReviewDate);
      return reviewDate && reviewDate < today;
    }).length;
    const nextSevenDays = reviewedItems.filter((item) => {
      const reviewDate = normalizeDate(item.nextReviewDate);
      if (!reviewDate || !today) return false;
      const diff = (reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length;

    const masteredItems = syllabusItems.filter((item) => item.accuracy >= 85).length;
    const studyingItems = syllabusItems.filter(
      (item) => item.isStudied && (item.accuracy === undefined || item.accuracy < 85)
    ).length;
    const untouchedItems = syllabusItems.filter((item) => !item.isStudied).length;

    return {
      totalHours,
      sessionsThisWeek,
      minutesThisWeek,
      avgAccuracy,
      reviewedItems: reviewedItems.length,
      overdueReviews,
      nextSevenDays,
      masteredItems,
      studyingItems,
      untouchedItems,
      totalSubjects: subjects.length,
      totalItems: syllabusItems.length
    };
  }, [studySessions, syllabusItems, subjects.length]);

  const tabStats = useMemo(() => ({
    ciclo: [
      { label: 'Matérias ativas', value: formatStatLabel(totals.totalSubjects) },
      { label: 'Horas planejadas registradas', value: formatStatLabel(totals.totalHours, 'h') },
      { label: 'Sessões nesta semana', value: formatStatLabel(totals.sessionsThisWeek) }
    ],
    revisoes: [
      { label: 'Itens com revisão', value: formatStatLabel(totals.reviewedItems) },
      { label: 'Revisões atrasadas', value: formatStatLabel(totals.overdueReviews) },
      { label: 'Próximas 7 dias', value: formatStatLabel(totals.nextSevenDays) }
    ],
    registro: [
      { label: 'Sessões totais', value: formatStatLabel(studySessions.length) },
      { label: 'Horas nesta semana', value: formatStatLabel(totals.minutesThisWeek, 'h') },
      { label: 'Último registro', value: (() => {
        if (!studySessions.length) return '—';
        const sorted = [...studySessions]
          .map((session) => normalizeDate(session.date || session.createdAt))
          .filter(Boolean)
          .sort((a, b) => b - a);
        if (!sorted.length) return '—';
        return sorted[0].toLocaleDateString('pt-BR');
      })() }
    ],
    indicadores: [
      { label: 'Média de acertos', value: totals.avgAccuracy !== null ? `${totals.avgAccuracy}%` : '—' },
      { label: 'Simulados registrados', value: formatStatLabel(studySessions.filter((session) => session.isSimulado).length) },
      { label: 'Total de itens mapeados', value: formatStatLabel(totals.totalItems) }
    ],
    mapa: [
      { label: 'Dominados', value: formatStatLabel(totals.masteredItems) },
      { label: 'Em estudo', value: formatStatLabel(totals.studyingItems) },
      { label: 'Pendentes', value: formatStatLabel(totals.untouchedItems) }
    ],
    edital: [
      { label: 'Itens do edital', value: formatStatLabel(totals.totalItems) },
      { label: 'Matérias no edital', value: formatStatLabel(totals.totalSubjects) },
      { label: 'Cobertura geral', value: (() => {
        if (!totals.totalItems) return '—';
        const studied = syllabusItems.filter((item) => item.isStudied).length;
        const percentage = Math.round((studied / totals.totalItems) * 100);
        return `${percentage}%`;
      })() }
    ]
  }), [studySessions, syllabusItems, totals]);

  const iconForTab = (tab) => {
    const Icon = tab.icon ?? Sparkles;
    return (
      <Icon size={16} />
    );
  };

  return (
    <div className="card space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.35em] text-slate-300">Experiência Estudei</span>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Domine cada etapa do seu preparo
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Explore como o organizador conecta planejamento, execução e revisão para manter o estudo consistente em qualquer fase.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FEATURE_TABS.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                isActive
                  ? `${tab.activeClasses}`
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10">
                {iconForTab(tab)}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              <Sparkles size={14} className="text-slate-100" />
              {activeTab.label}
            </div>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{activeTab.headline}</h3>
            <p className="text-sm leading-relaxed text-slate-300">{activeTab.description}</p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {activeTab.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                <div className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 ${activeTab.chipClasses}`}>
                  <CalendarRange size={14} />
                </div>
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Indicadores em tempo real</h4>
          <div className="grid gap-3">
            {tabStats[activeTab.id]?.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-slate-400">{stat.label}</span>
                <span className="font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Esses números usam os dados já registrados nas matérias, sessões e itens do edital para manter cada aba alinhada ao seu contexto atual.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductHighlights;
