import React, { useState } from "react";
import { PlusCircle, PlayCircle, BookOpen } from "lucide-react";

// Componentes
import { ProfileModal } from "./components/modals/ProfileModal";
import { SubjectModal } from "./components/modals/SubjectModal";
import { ItemDetailsModal } from "./components/modals/ItemDetailsModal";
import { SyllabusModal } from "./components/modals/SyllabusModal";
import { ProgressReportModal } from "./components/modals/ProgressReportModal";
import { SessionHistoryModal } from "./components/modals/SessionHistoryModal";

import { SessionModal } from "./components/SessionModal";
import { SubjectsOverview } from "./components/SubjectsOverview";
import { AppHeader } from "./components/Header";
import { Calendar } from "./components/Calendar";
import { StudyCycle } from "./components/StudyCycle";

// Hooks & Services
import { useStudyData } from "./hooks/useStudyData";
import { DataSyncService } from "./services/DataSyncService";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";

function App() {
  // --- UI STATE ---
  const [toast, setToast] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  // --- DATA STATE (via Hook) ---
  const {
    isLoading,
    studyProfiles,
    activeProfileId,
    subjects,
    studySessions,
    syllabusItems,

    // Setters needing direct access for simple ops
    setActiveProfileId,
    setSyllabusItems,
    setStudyProfiles,
    setSubjects,
    setStudySessions,

    // Actions
    addOrUpdateProfile,
    deleteProfile,
    addOrUpdateSubject,
    deleteSubject,
    addOrUpdateSession,
    updateSyllabusItem
  } = useStudyData(showToast);

  // --- LOCAL UI STATE ---
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSyllabusItem, setSelectedSyllabusItem] = useState(null);
  const [isCycleVisible, setIsCycleVisible] = useState(() =>
    loadFromLocalStorage("isCycleVisible", true),
  );

  // Modals Visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [isProgressReportModalOpen, setIsProgressReportModalOpen] = useState(false);
  const [isSessionHistoryModalOpen, setIsSessionHistoryModalOpen] = useState(false);

  // Selection Context
  const [currentSubjectForSession, setCurrentSubjectForSession] = useState(null);
  const [currentSubjectForSyllabus, setCurrentSubjectForSyllabus] = useState(null);
  const [selectedSubjectForHistory, setSelectedSubjectForHistory] = useState(null);
  const [initialSessionData, setInitialSessionData] = useState(null);
  const [cycleAdvanceNonce, setCycleAdvanceNonce] = useState(0);
  const [cycleSessionContext, setCycleSessionContext] = useState(null);

  // --- HANDLERS ---

  const handleProfileSubmit = (data) => {
    const action = addOrUpdateProfile(data, editingProfile?.id);
    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast(`Perfil ${action}!`, "success");
  };

  const handleDeleteProfile = (id) => {
    deleteProfile(id);
    showToast("Perfil excluído.", "success");
  };

  const handleSubjectSubmit = (data) => {
    addOrUpdateSubject(data, editingSubject?.id);
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    showToast("Matéria salva!", "success");
  };

  const handleDeleteSubject = (id) => {
    deleteSubject(id);
    showToast("Matéria excluída.", "success");
  };

  const handleSessionSubmit = (data) => {
    addOrUpdateSession(data, editingSession?.id);
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setCurrentSubjectForSession(null);
    setInitialSessionData(null);

    if (!editingSession && cycleSessionContext) {
      setCycleAdvanceNonce((prev) => prev + 1);
    }
    setCycleSessionContext(null);
    showToast("Sessão registrada!", "success");
  };

  // Import/Export
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

  // Helpers
  // Note: These could be moved to utils or hook if reused elsewhere, but okay here for now.
  const getSubjectStudyTime = (id) =>
    studySessions
      .filter((s) => s.subjectId === id)
      .reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

  const calculateSubjectProgress = (id) => {
    const items = syllabusItems.filter((i) => i.subjectId === id);
    if (!items.length) return 0;
    return (items.filter((i) => i.isStudied).length / items.length) * 100;
  };

  const handleToggleStudied = (itemId) => {
    setSyllabusItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;

      const newStatus = !item.isStudied;
      showToast(
        newStatus ? "Tópico marcado como estudado!" : "Tópico desmarcado como estudado.",
        "success"
      );

      const updated = prev.map((i) =>
        i.id === itemId ? { ...i, isStudied: newStatus } : i,
      );
      saveToLocalStorage("syllabusItems", updated);
      return updated;
    });
  };

  // --- RENDER ---
  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );

  const activeSubjects = subjects.filter(
    (s) => s.profileId === activeProfileId,
  );
  const activeSessions = studySessions.filter(
    (s) => s.profileId === activeProfileId,
  );
  const activeSyllabusItems = syllabusItems.filter((i) =>
    activeSubjects.some((s) => s.id === i.subjectId),
  );

  return (
    <main className="dashboard-layout">
      {/* 1. Header Global */}
      <AppHeader
        setIsProgressReportModalOpen={setIsProgressReportModalOpen}
        handleExportData={handleExportData}
        handleImportData={handleImportData}
        studyProfiles={studyProfiles}
        activeProfileId={activeProfileId}
        setActiveProfileId={setActiveProfileId}
        onOpenProfileModal={() => {
          setEditingProfile(null);
          setIsProfileModalOpen(true);
        }}
        onToggleCycle={() => {
          setIsCycleVisible((prev) => {
            const next = !prev;
            saveToLocalStorage("isCycleVisible", next);
            return next;
          });
        }}
        isCycleVisible={isCycleVisible}
      />

      {activeProfileId && isCycleVisible && (
        <section className="animate-enter" style={{ marginTop: "-8px" }}>
          <StudyCycle
            subjects={activeSubjects}
            syllabusItems={activeSyllabusItems}
            profileId={activeProfileId}
            advanceNonce={cycleAdvanceNonce}
            onSaveConfig={() => { }}
            onStartSession={(subjectId, topicId) => {
              setCurrentSubjectForSession(subjectId);
              setInitialSessionData({ subjectId, syllabusItemId: topicId });
              setCycleSessionContext({ subjectId, topicId });
              setIsSessionModalOpen(true);
            }}
            onMarkTopicStudied={(topicId) => {
              setSyllabusItems((prev) => {
                const updated = prev.map((i) =>
                  i.id === topicId ? { ...i, isStudied: true } : i,
                );
                saveToLocalStorage("syllabusItems", updated);
                return updated;
              });
              showToast("Tópico concluído!", "success");
            }}
          />
        </section>
      )}

      {/* 2. Conteúdo Principal */}
      {!activeProfileId ? (
        <div className="ui-card p-8 text-center animate-enter">
          <BookOpen
            size={48}
            className="mx-auto text-blue-500 mb-4 opacity-50"
          />
          <h2 className="text-xl font-bold text-white mb-2">
            Bem-vindo ao seu Organizador
          </h2>
          <p className="text-gray-400 mb-6">
            Crie seu primeiro perfil de estudos para começar.
          </p>
          <button
            className="ui-btn ui-btn-primary"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <PlusCircle size={18} /> Criar Perfil
          </button>
        </div>
      ) : (
        <>
          {/* Seção de Matérias */}
          <section className="animate-enter">
            <div className="section-header">
              <h2 className="section-title">Matérias e Edital</h2>
              <div className="flex gap-2">
                <button
                  className="ui-btn ui-btn-secondary"
                  onClick={() => setIsSubjectModalOpen(true)}
                >
                  <PlusCircle size={16} /> Nova Matéria
                </button>
                <button
                  className="ui-btn ui-btn-primary"
                  onClick={() => {
                    setCurrentSubjectForSession(null);
                    setInitialSessionData(null);
                    setCycleSessionContext(null);
                    setIsSessionModalOpen(true);
                  }}
                >
                  <PlayCircle size={16} /> Registrar Sessão
                </button>
              </div>
            </div>

            {activeSubjects.length === 0 ? (
              <div className="ui-card p-8 text-center border-dashed border-2 border-slate-700 bg-transparent">
                <p className="text-gray-400 mb-4">
                  Nenhuma matéria encontrada neste perfil.
                </p>
                <button
                  className="ui-btn ui-btn-primary"
                  onClick={() => setIsSubjectModalOpen(true)}
                >
                  Adicionar Primeira Matéria
                </button>
              </div>
            ) : (
              <SubjectsOverview
                subjects={activeSubjects}
                syllabusItems={activeSyllabusItems}
                setSyllabusItems={setSyllabusItems}
                expandedSubjects={expandedSubjects}
                setExpandedSubjects={setExpandedSubjects}
                getSubjectStudyTime={getSubjectStudyTime}
                setSelectedSyllabusItem={setSelectedSyllabusItem}
                setIsItemDetailsModalOpen={setIsItemDetailsModalOpen}
                studySessions={activeSessions}
                addOrUpdateSession={addOrUpdateSession}
                onToggleStudied={handleToggleStudied}
                setIsSubjectModalOpen={setIsSubjectModalOpen}
                setCurrentSubjectForSession={setCurrentSubjectForSession}
                setIsSessionModalOpen={setIsSessionModalOpen}
                setCurrentSubjectForSyllabus={setCurrentSubjectForSyllabus}
                setIsSyllabusModalOpen={setIsSyllabusModalOpen}
                setEditingSubject={setEditingSubject}
                setConfirmationDialog={setConfirmationDialog}
                handleDeleteSubject={handleDeleteSubject}
                calculateSubjectProgress={calculateSubjectProgress}
                setIsSessionHistoryModalOpen={setIsSessionHistoryModalOpen}
                setSelectedSubjectForHistory={setSelectedSubjectForHistory}
              />
            )}
          </section>

          {/* Seção Calendário */}
          <section className="animate-enter" style={{ animationDelay: "0.1s" }}>
            <Calendar
              studySessions={activeSessions}
              syllabusItems={activeSyllabusItems}
              subjects={activeSubjects}
            />
          </section>
        </>
      )}

      {/* --- MODAIS E UTILITÁRIOS --- */}
      {toast.isVisible && (
        <div
          className={`toast toast-${toast.type} animate-enter fixed top-4 right-4 z-50`}
        >
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {confirmationDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal p-6 max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">
              {confirmationDialog.title}
            </h3>
            <p className="text-gray-300 mb-6 text-sm">
              {confirmationDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="ui-btn ui-btn-secondary"
                onClick={() =>
                  setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))
                }
              >
                Cancelar
              </button>
              <button
                className="ui-btn ui-btn-primary bg-red-600 hover:bg-red-700 border-none shadow-none"
                onClick={confirmationDialog.onConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        editingProfile={editingProfile}
        onSubmit={handleProfileSubmit}
        showToast={showToast}
      />
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editingSubject={editingSubject}
        onSubmit={handleSubjectSubmit}
        showToast={showToast}
      />
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
          setCurrentSubjectForSession(null);
          setInitialSessionData(null);
          setCycleSessionContext(null);
        }}
        editingSession={editingSession}
        initialSessionData={initialSessionData}
        currentSubjectForSession={currentSubjectForSession}
        subjects={activeSubjects}
        syllabusItems={activeSyllabusItems}
        onSubmit={handleSessionSubmit}
        showToast={showToast}
      />
      <ItemDetailsModal
        isOpen={isItemDetailsModalOpen}
        onClose={() => setIsItemDetailsModalOpen(false)}
        selectedItem={selectedSyllabusItem}
        subjects={activeSubjects}
        studySessions={activeSessions}
      />
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        currentSubjectForSyllabus={currentSubjectForSyllabus}
        syllabusItems={activeSyllabusItems}
        setSyllabusItems={setSyllabusItems}
        showToast={showToast}
      />
      <ProgressReportModal
        isOpen={isProgressReportModalOpen}
        onClose={() => setIsProgressReportModalOpen(false)}
        subjects={activeSubjects}
        studySessions={activeSessions}
        syllabusItems={activeSyllabusItems}
        getSubjectStudyTime={getSubjectStudyTime}
      />
      <SessionHistoryModal
        isOpen={isSessionHistoryModalOpen}
        onClose={() => setIsSessionHistoryModalOpen(false)}
        selectedSubject={selectedSubjectForHistory}
        studySessions={activeSessions}
        setEditingSession={setEditingSession}
        setIsSessionModalOpen={setIsSessionModalOpen}
        setConfirmationDialog={setConfirmationDialog}
      />
    </main>
  );
}

export default App;
