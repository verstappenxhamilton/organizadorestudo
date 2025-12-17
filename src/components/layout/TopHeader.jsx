import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useStudyContext } from '../../context/StudyContext';

export const TopHeader = ({ onMenuClick }) => {
  const { studyProfiles, activeProfileId, setActiveProfileId } = useStudyContext();

  const activeProfile = studyProfiles.find(p => p.id === activeProfileId);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-white font-medium hidden sm:block">
          {activeProfile ? `Focando em: ${activeProfile.name}` : 'Bem-vindo'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {studyProfiles.length > 0 && (
          <select
            value={activeProfileId || ''}
            onChange={(e) => setActiveProfileId(e.target.value)}
            className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-700 outline-none focus:border-blue-500"
          >
            {studyProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        )}

        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <User size={18} />
        </div>
      </div>
    </header>
  );
};
