import React, { useState } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { ProfileModal } from '../components/modals/ProfileModal';
import { Trash2, Edit2, Download, Upload, AlertTriangle } from 'lucide-react';
import { DataSyncService } from '../services/DataSyncService';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const Settings = () => {
  const {
    studyProfiles,
    activeProfileId,
    addOrUpdateProfile,
    deleteProfile,
    setStudyProfiles,
    setSubjects,
    setStudySessions,
    setSyllabusItems,
    setActiveProfileId,
    subjects,
    studySessions,
    syllabusItems,
    showToast
  } = useStudyContext();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const handleProfileSubmit = (data) => {
    addOrUpdateProfile(data, editingProfile?.id);
    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast("Perfil salvo!", "success");
  };

  const handleDeleteProfile = (id) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja deletar este perfil? Todos os dados relacionados serão perdidos.",
      onConfirm: () => {
        deleteProfile(id);
        showToast("Perfil excluído.", "success");
        setConfirmationDialog({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      }
    });
  };

  const handleExportData = () => {
    DataSyncService.exportData({
      studyProfiles,
      subjects,
      studySessions,
      syllabusItems
    }, showToast);
  };

  const handleImportData = (file) => {
    DataSyncService.importData(file, {
      setStudyProfiles,
      setSubjects,
      setStudySessions,
      setSyllabusItems,
      setActiveProfileId,
      showToast
    });
  };

  return (
    <div className="animate-enter space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-slate-400">Gerencie perfis e dados do aplicativo.</p>
      </div>

      {/* Profiles Management */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Perfis de Estudo</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingProfile(null);
              setIsProfileModalOpen(true);
            }}
          >
            Novo Perfil
          </button>
        </div>

        <div className="space-y-4">
          {studyProfiles.map(profile => (
            <div key={profile.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-bold text-white">{profile.name}</h3>
                <p className="text-sm text-slate-400">Criado em: {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  onClick={() => {
                    setEditingProfile(profile);
                    setIsProfileModalOpen(true);
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  onClick={() => handleDeleteProfile(profile.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {studyProfiles.length === 0 && (
            <p className="text-center text-slate-500 py-4">Nenhum perfil encontrado.</p>
          )}
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Gerenciamento de Dados</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3 text-blue-400">
              <Download size={24} />
              <h3 className="font-bold">Exportar Backup</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Baixe um arquivo JSON com todos os seus dados para segurança ou migração.</p>
            <button
              onClick={handleExportData}
              className="btn btn-secondary w-full justify-center"
            >
              Exportar Dados
            </button>
          </div>

          <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3 text-emerald-400">
              <Upload size={24} />
              <h3 className="font-bold">Importar Backup</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">Restaure seus dados a partir de um arquivo de backup anterior.</p>
            <label className="btn btn-secondary w-full justify-center cursor-pointer">
              Selecionar Arquivo
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) handleImportData(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
          <AlertTriangle className="text-red-500 shrink-0" />
          <p className="text-sm text-red-200">
            <strong>Cuidado:</strong> Ao limpar o cache do navegador, seus dados podem ser perdidos se não exportados. Faça backups regularmente.
          </p>
        </div>
      </section>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        editingProfile={editingProfile}
        onSubmit={handleProfileSubmit}
        showToast={showToast}
      />

      <ConfirmationModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        isDanger={true}
      />
    </div>
  );
};
