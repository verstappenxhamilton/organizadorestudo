import React from 'react';
import { ShieldCheck, SunMoon, WifiOff, MonitorSmartphone, BellRing } from 'lucide-react';

const ASSURANCES = [
  {
    id: 'privacidade',
    icon: ShieldCheck,
    title: 'Privacidade em primeiro lugar',
    description:
      'O Estudei não compartilha dados com terceiros e mantém seus registros de estudo seguros, mesmo durante a sincronização.',
    badge: 'Política Google Play'
  },
  {
    id: 'temas',
    icon: SunMoon,
    title: 'Tema claro e escuro',
    description:
      'Alterne entre temas otimizados para longas jornadas de estudo e reduza a fadiga visual em qualquer ambiente.',
    badge: 'Interface moderna'
  },
  {
    id: 'offline',
    icon: WifiOff,
    title: 'Modo offline com sincronização',
    description:
      'Continue estudando mesmo sem internet. Assim que a conexão retorna, tudo é sincronizado com a nuvem automaticamente.',
    badge: 'Foco total'
  },
  {
    id: 'multi-plataforma',
    icon: MonitorSmartphone,
    title: 'Web, iOS e Android integrados',
    description:
      'Planeje pelo desktop, revise no celular e acompanhe métricas no tablet. Seus dados ficam alinhados em todas as versões.',
    badge: 'Experiência contínua'
  },
  {
    id: 'notificacoes',
    icon: BellRing,
    title: 'Alertas personalizados',
    description:
      'Configure lembretes push para revisões, novos ciclos, notificações de estudo e atualizações do aplicativo.',
    badge: 'Lembretes inteligentes'
  }
];

export const ExperienceAssurances = () => {
  return (
    <div className="card space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.35em] text-slate-300">Experiência Estendida</span>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Tudo o que você espera de um app profissional</h2>
        <p className="text-sm text-slate-300">
          Recursos essenciais para estudar com tranquilidade: segurança, personalização, mobilidade e lembretes que mantêm sua rotina em dia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ASSURANCES.map(({ id, icon: Icon, title, description, badge }) => (
          <article
            key={id}
            className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-5 transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200">
                <Icon size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{badge}</span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ExperienceAssurances;
