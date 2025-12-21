import React, { useMemo, useState, useEffect } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { ProfileModal } from '../components/modals/ProfileModal';
import { Trash2, Edit2, Download, Upload, AlertTriangle, Layers } from 'lucide-react';
import { DataSyncService } from '../services/DataSyncService';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { seedGlobalEditais, getAvailableEditais } from '../utils/editalManager';
import { mergeStudyContentWithExisting } from '../utils/editalComparison';
import { saveToLocalStorage } from '../utils/localStorage';
import { EditalComparisonModal } from '../components/modals/EditalComparisonModal';

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
    showToast,
    updateProfileEditais
  } = useStudyContext();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editais, setEditais] = useState([]);
  const [selectedEditalIds, setSelectedEditalIds] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  useEffect(() => {
    seedGlobalEditais();
    setEditais(getAvailableEditais());
  }, []);

  useEffect(() => {
    const activeProfile = studyProfiles.find((profile) => profile.id === activeProfileId);
    setSelectedEditalIds(Array.isArray(activeProfile?.editalIds) ? activeProfile.editalIds : []);
  }, [activeProfileId, studyProfiles]);

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

  const selectedEditais = useMemo(
    () => editais.filter((edital) => selectedEditalIds.includes(edital.id)),
    [editais, selectedEditalIds],
  );

  const handleToggleEdital = (editalId) => {
    setSelectedEditalIds((prev) =>
      prev.includes(editalId) ? prev.filter((id) => id !== editalId) : [...prev, editalId],
    );
  };

  const handleApplyEditais = () => {
    if (!activeProfileId) {
      showToast('Selecione um perfil para aplicar editais.', 'warning');
      return;
    }

    if (selectedEditais.length === 0) {
      showToast('Selecione pelo menos um edital.', 'warning');
      return;
    }

    const { subjects: mergedSubjects, syllabusItems: mergedItems } = mergeStudyContentWithExisting(
      selectedEditais,
      activeProfileId,
      subjects,
      syllabusItems,
    );

    if (mergedSubjects.length === 0) {
      showToast('Os editais selecionados não possuem matérias ou tópicos cadastrados.', 'warning');
      updateProfileEditais(activeProfileId, selectedEditalIds);
      return;
    }

    const mergedSubjectIds = new Set(mergedSubjects.map((subject) => subject.id));
    const mergedItemIds = new Set(mergedItems.map((item) => item.id));

    const otherSubjects = subjects.filter((subject) => subject.profileId !== activeProfileId);
    const retainedSubjects = subjects.filter(
      (subject) => subject.profileId === activeProfileId && !mergedSubjectIds.has(subject.id),
    );
    const nextSubjects = [...otherSubjects, ...retainedSubjects, ...mergedSubjects];

    const otherItems = syllabusItems.filter((item) => {
      const subject = subjects.find((s) => s.id === item.subjectId);
      return subject?.profileId !== activeProfileId;
    });
    const retainedItems = syllabusItems.filter((item) => {
      if (mergedItemIds.has(item.id)) return false;
      const subject = subjects.find((s) => s.id === item.subjectId);
      return subject?.profileId === activeProfileId;
    });
    const nextItems = [...otherItems, ...retainedItems, ...mergedItems];

    setSubjects(nextSubjects);
    setSyllabusItems(nextItems);
    saveToLocalStorage('subjects', nextSubjects);
    saveToLocalStorage('syllabusItems', nextItems);
    updateProfileEditais(activeProfileId, selectedEditalIds);
    showToast('Editais aplicados ao perfil!', 'success');
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
        <h2 className="text-xl font-bold text-white mb-2">Editais Globais</h2>
        <p className="text-sm text-slate-400 mb-6">
          Selecione um ou mais editais globais para mesclar matérias e tópicos no perfil ativo.
        </p>

        {editais.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum edital global disponível.</p>
        ) : (
          <div className="space-y-3">
            {editais.map((edital) => (
              <label
                key={edital.id}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                  checked={selectedEditalIds.includes(edital.id)}
                  onChange={() => handleToggleEdital(edital.id)}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{edital.nome}</h3>
                    {edital.isGlobal && (
                      <span className="text-xs uppercase tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Global
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {edital.concurso || 'Concurso não informado'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {edital.itensEdital?.length || 0} tópico(s) · {edital.materias?.length || 0} matéria(s)
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="btn btn-primary"
            onClick={handleApplyEditais}
            disabled={selectedEditalIds.length === 0}
          >
            <Layers size={18} />
            Aplicar editais ao perfil ativo
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsComparisonOpen(true)}
            disabled={selectedEditalIds.length < 2}
          >
            Comparar editais
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedEditalIds([])}
            disabled={selectedEditalIds.length === 0}
          >
            Limpar seleção
          </button>
        </div>
      </section>

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

      <EditalComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        editais={selectedEditais}
      />
    </div>
  );
};
