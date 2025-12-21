import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  RotateCw,
  BarChart3,
  Settings,
  Menu,
  X,
  BookMarked
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const links = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/subjects', label: 'Matérias', icon: BookOpen },
    { path: '/cycle', label: 'Ciclo de Estudos', icon: RotateCw },
    { path: '/editais', label: 'Biblioteca de Editais', icon: BookMarked },
    { path: '/schedule', label: 'Agenda', icon: CalendarDays },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800
          transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-violet-500 p-2 rounded-lg">
              <BookMarked className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Organizador</h1>
              <p className="text-slate-400 text-xs">de Estudos</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-blue-600/10 text-blue-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }
              `}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
