import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  RefreshCw,
  Timer,
  BarChart3,
  MapPin,
  ScrollText,
  Cog,
  WifiOff,
  MonitorSmartphone,
  CalendarClock,
  Target,
  TrendingUp
} from 'lucide-react';

const formatHours = (value) => {
  if (!value || Number.isNaN(value)) {
    return '0h';
  }
  if (value < 1) {
    return `${Math.round(value * 60)}min`;
  }
  return `${value.toFixed(1)}h`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${Math.round(value)}%`;
};

export const ExperienceNavigator = ({
  activeProfile,
  subjects,
  sessions,
  syllabusItems,
  simulados,
  urgentReviewItems,
  upcomingSessions,
  upcomingSimulados,
  nextReviewLabel,
  totalHoursStudied,
  studiedPercentage
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    averageDailyHours,
    streakDays,
    sessionsBySubject,
    accuracyAverage
  } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        averageDailyHours: 0,
        streakDays: 0,
        sessionsBySubject: new Map(),
        accuracyAverage: null
      };
    }

    const totalsByDay = new Map();
    const totalsBySubject = new Map();
    const accuracyValues = [];

    sessions.forEach((session) => {
      if (session.date) {
        const dayKey = session.date;
        totalsByDay.set(dayKey, (totalsByDay.get(dayKey) || 0) + (session.duration || 0));
      }

      if (session.subjectId) {
        totalsBySubject.set(session.subjectId, (totalsBySubject.get(session.subjectId) || 0) + (session.duration || 0));
      }

      if (session.accuracy !== undefined && session.accuracy !== null) {
        accuracyValues.push(session.accuracy);
      }
    });

    const totalMinutes = Array.from(totalsByDay.values()).reduce((sum, value) => sum + value, 0);
    const averageDailyHours = totalMinutes / Math.max(totalsByDay.size, 1) / 60;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streakDays = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - offset);
      const iso = checkDate.toISOString().split('T')[0];
      if (totalsByDay.has(iso)) {
        streakDays += 1;
      } else {
        break;
      }
    }

    const accuracyAverage = accuracyValues.length
      ? accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length
      : null;

    return {
      averageDailyHours,
      streakDays,
      sessionsBySubject: totalsBySubject,
      accuracyAverage
    };
  }, [sessions]);

  const {
    targetHours,
    topSubjects,
    reviewCoverage,
    dominatedTopics,
    focusTopics
  } = useMemo(() => {
    const totalTarget = subjects.reduce((sum, subject) => sum + (Number(subject.targetHours) || 0), 0);

    const subjectBreakdown = subjects.map((subject) => {
      const planned = Number(subject.targetHours) || 0;
      const executedMinutes = sessionsBySubject.get(subject.id) || 0;
      return {
        id: subject.id,
        name: subject.name,
        planned,
        executed: executedMinutes / 60
      };
    });

    const topSubjects = subjectBreakdown
      .filter((entry) => entry.planned > 0 || entry.executed > 0)
      .sort((a, b) => b.executed - a.executed)
      .slice(0, 3);

    const totalItems = syllabusItems.length;
    const scheduledReviews = syllabusItems.filter((item) => item.nextReviewDate).length;
    const reviewCoverage = totalItems > 0 ? (scheduledReviews / totalItems) * 100 : null;

    const dominatedTopics = syllabusItems.filter((item) => (item.accuracy || 0) >= 85).length;
    const focusTopics = syllabusItems.filter((item) => item.isStudied && (item.accuracy || 0) < 85).length;

    return {
      targetHours: totalTarget,
      topSubjects,
      reviewCoverage,
      dominatedTopics,
      focusTopics
    };
  }, [subjects, sessionsBySubject, syllabusItems]);

  const totalUpcomingSessions = upcomingSessions?.length || 0;
  const totalRevisoesPendentes = urgentReviewItems?.length || 0;
  const totalSimulados = simulados?.length || 0;
  const upcomingSimuladosCount = upcomingSimulados?.length || 0;

  const tabs = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        badge: 'Visão diária',
        icon: LayoutDashboard,
        summary: 'Rotina sem atritos',
        description:
          'Acompanhe calendário, blocos agendados e alertas de revisão em um só lugar. O painel inicial conecta seus indicadores principais com ações rápidas para registrar sessões, abrir revisões ou importar novos editais.',
        metrics: [
          {
            label: 'Horas acumuladas',
            value: formatHours(totalHoursStudied),
            helper: 'tempo registrado no ciclo ativo'
          },
          {
            label: 'Cadência diária',
            value: formatHours(averageDailyHours),
            helper: streakDays > 0 ? `${streakDays} dia(s) consecutivos` : 'sem sequência ativa'
          },
          {
            label: 'Blocos planejados',
            value: totalUpcomingSessions,
            helper: 'sessões futuras com duração definida'
          }
        ],
        highlights: [
          'Calendário unificado do dia com próximas sessões e revisões pendentes.',
          'Alertas de produtividade destacam atrasos em metas diárias.',
          'Atalhos para abrir cronômetro, registrar bloco ou ajustar o ciclo.'
        ],
        actions: [
          {
            icon: CalendarClock,
            title: 'Reveja sua agenda da semana',
            description: 'Arraste sessões na linha do tempo para manter o plano realista.'
          },
          {
            icon: TrendingUp,
            title: 'Ative o resumo inteligente',
            description: 'Combine progresso do edital com revisões críticas na abertura do app.'
          }
        ]
      },
      {
        id: 'cycle',
        label: 'Ciclo de Estudos',
        badge: 'Planejamento',
        icon: CalendarRange,
        summary: 'Carga flexível e adaptável',
        description:
          'Monte ciclos realistas distribuindo horas por disciplina e ajuste automaticamente quando sua rotina muda. O Estudei sugere redistribuições sempre que você fica abaixo da meta diária.',
        metrics: [
          {
            label: 'Carga semanal planejada',
            value: targetHours > 0 ? `${targetHours}h` : 'Defina metas',
            helper: 'soma das horas alvo das matérias'
          },
          {
            label: 'Top disciplinas',
            value: topSubjects.length > 0 ? topSubjects.map((item) => item.name).join(', ') : 'Defina prioridades',
            helper: 'maior dedicação na semana'
          },
          {
            label: 'Blocos futuros',
            value: totalUpcomingSessions,
            helper: 'sessões agendadas a partir de hoje'
          }
        ],
        highlights: [
          'Distribuição automática de horas ao longo da semana com base na sua disponibilidade.',
          'Sugestões de ajuste quando uma meta diária não é atingida.',
          'Permite reorganizar a ordem das disciplinas por prioridade.'
        ],
        actions: [
          {
            icon: CalendarRange,
            title: 'Reequilibre a carga da semana',
            description: 'Use o ajuste automático para recuperar horas não cumpridas.'
          }
        ]
      },
      {
        id: 'reviews',
        label: 'Revisões',
        badge: 'Repetição espaçada',
        icon: RefreshCw,
        summary: 'Memória sob controle',
        description:
          'A agenda de revisões aplica espaçamentos inteligentes para você revisar no momento certo. Receba lembretes e ajuste intervalos conforme acurácia e dificuldade de cada tópico.',
        metrics: [
          {
            label: 'Pendências',
            value: totalRevisoesPendentes,
            helper: 'itens aguardando revisão hoje'
          },
          {
            label: 'Cobertura do edital',
            value: formatPercentage(reviewCoverage),
            helper: 'itens com revisão agendada'
          },
          {
            label: 'Próxima revisão',
            value: nextReviewLabel || '—',
            helper: 'data sugerida pelo algoritmo'
          }
        ],
        highlights: [
          'Lembretes automáticos quando uma revisão fica atrasada.',
          'Intervalos recomendados com base no percentual de acerto.',
          'Controle visual das revisões concluídas e pendentes por matéria.'
        ],
        actions: [
          {
            icon: RefreshCw,
            title: 'Ajuste os espaçamentos',
            description: 'Personalize os ciclos (1, 3, 7, 15, 30 dias) conforme sua retenção.'
          }
        ]
      },
      {
        id: 'records',
        label: 'Registro de Estudos',
        badge: 'Diário inteligente',
        icon: Timer,
        summary: 'Tudo que você fez, em um só lugar',
        description:
          'Registre horas, páginas lidas, videoaulas, questões e resumos com o cronômetro integrado. Classifique por disciplina, material e tipo de contato para alimentar seus indicadores automaticamente.',
        metrics: [
          {
            label: 'Sessões registradas',
            value: sessions.length,
            helper: 'entradas no período atual'
          },
          {
            label: 'Horas registradas',
            value: formatHours(totalHoursStudied),
            helper: 'considerando todos os blocos'
          },
          {
            label: 'Acurácia média',
            value: formatPercentage(accuracyAverage),
            helper: 'baseado nos blocos com questões'
          }
        ],
        highlights: [
          'Cronômetro integrado para medir tempo real da sessão.',
          'Classificação por tipo de material e forma de estudo (primeiro contato ou revisão).',
          'Integração direta com a aba Estatísticas e mapa de dificuldades.'
        ],
        actions: [
          {
            icon: Timer,
            title: 'Ative o timer instantâneo',
            description: 'Comece a contagem direto do dashboard para não perder minutos.'
          }
        ]
      },
      {
        id: 'analytics',
        label: 'Indicadores',
        badge: 'Estatísticas',
        icon: BarChart3,
        summary: 'Progresso com dados acionáveis',
        description:
          'Gráficos e indicadores mostram consistência, evolução por disciplina e desempenho em simulados. Identifique quedas de produtividade e ajuste o plano com base em dados reais.',
        metrics: [
          {
            label: 'Progresso do edital',
            value: formatPercentage(studiedPercentage),
            helper: 'itens marcados como estudados'
          },
          {
            label: 'Simulados agendados',
            value: upcomingSimuladosCount,
            helper: totalSimulados > 0 ? `${totalSimulados} já realizados` : 'comece registrando um simulado'
          },
          {
            label: 'Acurácia média',
            value: formatPercentage(accuracyAverage),
            helper: 'questões registradas'
          }
        ],
        highlights: [
          'Gráficos de evolução temporal de horas e desempenho.',
          'Distribuição de tempo por disciplina e tipo de material.',
          'Percentual de acerto e dificuldade em simulados para guiar ajustes.'
        ],
        actions: [
          {
            icon: Target,
            title: 'Analise seus simulados',
            description: 'Identifique quedas de acerto e crie revisões específicas.'
          }
        ]
      },
      {
        id: 'map',
        label: 'Mapa de Dificuldades',
        badge: 'Prioridades',
        icon: MapPin,
        summary: 'Veja onde acelerar ou revisar',
        description:
          'Classifique tópicos como dominados, em andamento ou pendentes para visualizar rapidamente quais conteúdos precisam de reforço. O mapa usa seus registros e acurácia para priorizar revisões.',
        metrics: [
          {
            label: 'Dominados',
            value: dominatedTopics,
            helper: 'acurácia ≥ 85%'
          },
          {
            label: 'Em foco',
            value: focusTopics,
            helper: 'precisam de reforço'
          },
          {
            label: 'A iniciar',
            value: Math.max(syllabusItems.length - (dominatedTopics + focusTopics), 0),
            helper: 'ainda sem estudo registrado'
          }
        ],
        highlights: [
          'Marcações rápidas (dominado, estudado, não estudado).',
          'Integração com percentuais de acerto para priorização automática.',
          'Sugestões de reforço para tópicos críticos.'
        ],
        actions: [
          {
            icon: MapPin,
            title: 'Revise o mapa semanalmente',
            description: 'Reclassifique tópicos após cada simulado ou revisão importante.'
          }
        ]
      },
      {
        id: 'edital',
        label: 'Edital Verticalizado',
        badge: 'Conteúdo',
        icon: ScrollText,
        summary: 'Controle total do edital',
        description:
          'Visualize o edital em formato hierárquico, marque itens concluídos e acompanhe a porcentagem estudada. Ideal para garantir que nenhum tópico fique para trás antes da prova.',
        metrics: [
          {
            label: 'Itens mapeados',
            value: syllabusItems.length,
            helper: 'total importado ou criado'
          },
          {
            label: 'Itens estudados',
            value: Math.round((studiedPercentage / 100) * syllabusItems.length) || 0,
            helper: 'concluídos no edital'
          },
          {
            label: 'Cobertura geral',
            value: formatPercentage(studiedPercentage),
            helper: 'progresso total'
          }
        ],
        highlights: [
          'Estrutura hierárquica para navegar por temas e subtemas.',
          'Marcação rápida de status e peso de cada item.',
          'Importação de editais oficiais com poucos cliques.'
        ],
        actions: [
          {
            icon: ScrollText,
            title: 'Sincronize com o edital oficial',
            description: 'Use a biblioteca de editais globais para começar com base atualizada.'
          }
        ]
      },
      {
        id: 'settings',
        label: 'Configurações',
        badge: 'Personalização',
        icon: Cog,
        summary: 'Seu ambiente, do seu jeito',
        description:
          'Ajuste metas, duração padrão dos blocos, ordem das disciplinas, temas claro/escuro e notificações push. Customize o aplicativo para o seu ritmo de estudos.',
        metrics: [
          {
            label: 'Concursos ativos',
            value: activeProfile ? 1 : 0,
            helper: activeProfile ? activeProfile.name : 'Crie seu primeiro perfil'
          },
          {
            label: 'Disciplinas cadastradas',
            value: subjects.length,
            helper: 'organizadas no ciclo atual'
          },
          {
            label: 'Notificações',
            value: 'Push e e-mail',
            helper: 'personalize lembretes de estudo'
          }
        ],
        highlights: [
          'Temas claro e escuro para estudar com conforto visual.',
          'Configuração das metas diárias e semanais de estudo.',
          'Controle sobre a ordem das disciplinas e duração dos blocos.'
        ],
        actions: [
          {
            icon: Cog,
            title: 'Revise suas metas mensais',
            description: 'Atualize metas de horas sempre que o edital mudar de fase.'
          }
        ]
      },
      {
        id: 'offline',
        label: 'Modo Offline',
        badge: 'Sem internet',
        icon: WifiOff,
        summary: 'Continue estudando em qualquer lugar',
        description:
          'Registre blocos e revise conteúdos mesmo sem conexão. Assim que o aparelho voltar à internet, o Estudei sincroniza automaticamente seus dados com a nuvem.',
        metrics: [
          {
            label: 'Sincronizações pendentes',
            value: 'Automáticas',
            helper: 'fila enviada ao reconectar'
          },
          {
            label: 'Backup',
            value: 'Nuvem segura',
            helper: 'acesso web garantido'
          },
          {
            label: 'Privacidade',
            value: 'Dados privados',
            helper: 'sem compartilhamento com terceiros'
          }
        ],
        highlights: [
          'Funciona mesmo sem conexão constante.',
          'Fila de sincronização automática após reconectar.',
          'Dados protegidos sem compartilhamento com terceiros.'
        ],
        actions: [
          {
            icon: WifiOff,
            title: 'Planeje viagens ou deslocamentos',
            description: 'Baixe materiais e mantenha o registro de estudos sem depender da rede.'
          }
        ]
      },
      {
        id: 'platforms',
        label: 'Plataformas',
        badge: 'Web • iOS • Android',
        icon: MonitorSmartphone,
        summary: 'Experiência fluida em todos os dispositivos',
        description:
          'O Estudei está disponível na web, Android e iOS. Seu progresso é sincronizado entre plataformas para que você continue exatamente de onde parou, seja no computador ou no celular.',
        metrics: [
          {
            label: 'Aplicativos móveis',
            value: 'iOS e Android',
            helper: 'interface otimizada por gestos'
          },
          {
            label: 'Versão web',
            value: 'Completa',
            helper: 'ideal para análises detalhadas'
          },
          {
            label: 'Sincronização',
            value: 'Tempo quase real',
            helper: 'dados unificados na nuvem'
          }
        ],
        highlights: [
          'Apps nativos lançados para iOS e Android com gestos otimizados.',
          'Interface responsiva adaptada a telas menores.',
          'Continuidade total do estudo entre web e mobile.'
        ],
        actions: [
          {
            icon: MonitorSmartphone,
            title: 'Instale o app no seu dispositivo',
            description: 'Acesse a loja oficial e sincronize com a sua conta Estudei.'
          }
        ]
      }
    ],
    [
      totalHoursStudied,
      averageDailyHours,
      streakDays,
      totalUpcomingSessions,
      targetHours,
      topSubjects,
      totalRevisoesPendentes,
      reviewCoverage,
      nextReviewLabel,
      accuracyAverage,
      totalSimulados,
      studiedPercentage,
      syllabusItems.length,
      dominatedTopics,
      focusTopics,
      activeProfile,
      subjects.length,
      upcomingSimuladosCount
    ]
  );

  const activeContent = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="card experience-showcase">
      <header className="experience-showcase__header">
        <div>
          <span className="experience-showcase__eyebrow">Jornada Estudei</span>
          <h3 className="experience-showcase__title">Domine cada etapa do seu preparo</h3>
          <p className="experience-showcase__subtitle">
            Explore as páginas do aplicativo e veja como cada uma contribui para um estudo organizado, com dados, revisões e sincronização contínua.
          </p>
        </div>
        {activeProfile && (
          <div className="experience-showcase__profile">
            <span className="experience-chip">Concurso ativo</span>
            <strong>{activeProfile.name}</strong>
            {activeProfile.examDate && (
              <span className="experience-showcase__profile-date">
                Prova em {new Date(activeProfile.examDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        )}
      </header>

      <div className="experience-tabs" role="tablist" aria-label="Páginas do aplicativo">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={`experience-tab ${activeTab === id ? 'experience-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="experience-tab__icon">
              <Icon size={16} />
            </span>
            <span className="experience-tab__content">
              <span className="experience-tab__label">{label}</span>
              <span className="experience-tab__badge">{badge}</span>
            </span>
          </button>
        ))}
      </div>

      <section className="experience-panel" role="tabpanel">
        <header className="experience-panel__header">
          <div>
            <span className="experience-panel__badge">{activeContent.badge}</span>
            <h4 className="experience-panel__title">{activeContent.summary}</h4>
          </div>
        </header>
        <p className="experience-panel__description">{activeContent.description}</p>

        <div className="experience-metrics">
          {activeContent.metrics.map((metric) => (
            <div key={metric.label} className="experience-metric">
              <span className="experience-metric__value">{metric.value}</span>
              <span className="experience-metric__label">{metric.label}</span>
              <span className="experience-metric__helper">{metric.helper}</span>
            </div>
          ))}
        </div>

        <ul className="experience-callouts">
          {activeContent.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="experience-actions">
          {activeContent.actions.map((action) => (
            <div key={action.title} className="experience-action">
              <div className="experience-action__icon">
                <action.icon size={16} />
              </div>
              <div>
                <p className="experience-action__title">{action.title}</p>
                <p className="experience-action__description">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExperienceNavigator;
