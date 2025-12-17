import React from 'react';
import { useStudyContext } from '../context/StudyContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Reports = () => {
  const {
    activeSubjects,
    activeSessions,
    getSubjectStudyTime
  } = useStudyContext();

  const data = activeSubjects.map(s => ({
    name: s.name,
    hours: getSubjectStudyTime(s.id),
    color: s.color || '#3b82f6'
  })).filter(d => d.hours > 0);

  const totalHours = activeSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

  return (
    <div className="animate-enter space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Relatórios</h1>
        <p className="text-slate-400">Análise detalhada do seu desempenho.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hours per Subject Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Horas por Matéria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Distribuição de Estudos</h3>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="hours"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                   itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-white">{totalHours.toFixed(1)}h</span>
                <p className="text-slate-500 text-sm">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
