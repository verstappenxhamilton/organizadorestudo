import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStudyContext } from '../context/StudyContext';
import { SubjectsOverview } from '../components/SubjectsOverview';
import { PlusCircle, PlayCircle } from 'lucide-react';
import { SubjectModal } from '../components/modals/SubjectModal';
import { ItemDetailsModal } from '../components/modals/ItemDetailsModal';
import { SessionModal } from '../components/SessionModal';
import { SyllabusModal } from '../components/modals/SyllabusModal';
import { SessionHistoryModal } from '../components/modals/SessionHistoryModal';
import { EditalSelector } from '../components/EditalSelector';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { saveToLocalStorage } from '../utils/localStorage';
import { Split } from 'lucide-react';
import parsedEditais from '../data/parsedEditais.json';

export const Subjects = () => {
  const {
    activeSubjects,
    activeSyllabusItems,
    setSyllabusItems,
    activeSessions,
    addOrUpdateSession,
    deleteSession,
    addOrUpdateSubject,
    deleteSubject,
    showToast,
    getSubjectStudyTime,
    calculateSubjectProgress,
    studySessions,
  } = useStudyContext();

  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSyllabusItem, setSelectedSyllabusItem] = useState(null);

  // Comparison State
  const [comparisonEditalId, setComparisonEditalId] = useState(null);
  const [isEditalSelectorOpen, setIsEditalSelectorOpen] = useState(false);

  const location = useLocation();

  // Handle auto-expand and modal opening from navigation
  useEffect(() => {
      const state = location.state;
      if (state) {
          if (state.expandSubjectId) {
              setExpandedSubjects(prev => ({
                  ...prev,
                  [state.expandSubjectId]: true
              }));

              setTimeout(() => {
                  const element = document.querySelector(`.subject-card h3:contains('${state.expandSubjectId}')`);
                  // ID selector might be better if I added IDs to cards.
                  // But let's stick to expanding for now as I didn't add IDs to cards.
                  // Actually, scrollIntoView might not work without IDs.
                  // Let's just ensure it is expanded.
              }, 100);
          }

          if (state.openSessionModal) {
              // Set initial data first
              if (state.initialData) {
                  const { subjectId, ...rest } = state.initialData;
                  setCurrentSubjectForSession(subjectId);
                  setInitialSessionData(rest);
                  // Ensure subject is expanded too if provided
                  if (subjectId) {
                      setExpandedSubjects(prev => ({ ...prev, [subjectId]: true }));
                  }
              }
              setIsSessionModalOpen(true);

              // Clear state to prevent reopening on refresh?
              // React Router state persists on refresh, but we might want that.
              // If we want to consume it once, we could replace history, but standard behavior is fine.
          }
      }
  }, [location.state]);

  // Modals State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isSessionHistoryModalOpen, setIsSessionHistoryModalOpen] = useState(false);

  // Context for modals
  const [currentSubjectForSession, setCurrentSubjectForSession] = useState(null);
  const [currentSubjectForSyllabus, setCurrentSubjectForSyllabus] = useState(null);
  const [selectedSubjectForHistory, setSelectedSubjectForHistory] = useState(null);
  const [initialSessionData, setInitialSessionData] = useState(null);

  // Confirmation Dialog (Local state for now, could be global)
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const handleToggleStudied = (itemId) => {
    setSyllabusItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      const newStatus = !item.isStudied;
      showToast(newStatus ? "Marcado como estudado!" : "Desmarcado.", "success");
      const updated = prev.map((i) => i.id === itemId ? { ...i, isStudied: newStatus } : i);
      saveToLocalStorage("syllabusItems", updated);
      return updated;
    });
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

  const handleDeleteSession = (sessionId) => {
      deleteSession(sessionId);
      showToast("Sessão excluída.", "success");
  };

  const handleSessionSubmit = (data) => {
    addOrUpdateSession(data, editingSession?.id);
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setCurrentSubjectForSession(null);
    setInitialSessionData(null);
    showToast("Sessão registrada!", "success");
  };

  return (
    <div className="animate-enter space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Matérias</h1>
          <p className="text-slate-400">Gerencie seus estudos e acompanhe o edital.</p>
        </div>
        <div className="flex gap-3">
          {comparisonEditalId ? (
             <button
                className="btn bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20 flex items-center gap-2"
                onClick={() => setComparisonEditalId(null)}
              >
                <Split size={18} /> Parar Comparação
             </button>
          ) : (
            <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={() => setIsEditalSelectorOpen(true)}
            >
                <Split size={18} /> Comparar Edital
            </button>
          )}

           <button
            className="btn btn-secondary flex items-center gap-2"
            onClick={() => setIsSubjectModalOpen(true)}
          >
            <PlusCircle size={18} /> Nova Matéria
          </button>
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setCurrentSubjectForSession(null);
              setInitialSessionData(null);
              setIsSessionModalOpen(true);
            }}
          >
            <PlayCircle size={18} /> Registrar Sessão
          </button>
        </div>
      </div>

      {comparisonEditalId && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4 animate-enter">
           <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
             <Split size={24} />
           </div>
           <div>
             <h3 className="font-bold text-white">Modo Comparação Ativo</h3>
             <p className="text-sm text-slate-400">
               Comparando seus estudos com <span className="text-sky-400 font-medium">{parsedEditais.find(e => e.id === comparisonEditalId)?.nome || 'Edital Selecionado'}</span>.
             </p>
           </div>
        </div>
      )}

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
            comparisonEditalId={comparisonEditalId}
        />

        {isEditalSelectorOpen && (
            <EditalSelector
                onSelect={(id) => {
                    setComparisonEditalId(id);
                    setIsEditalSelectorOpen(false);
                }}
                onCancel={() => setIsEditalSelectorOpen(false)}
                currentComparisonId={comparisonEditalId}
            />
        )}

      {/* Modals reused from original code */}
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
      <SessionHistoryModal
        isOpen={isSessionHistoryModalOpen}
        onClose={() => setIsSessionHistoryModalOpen(false)}
        selectedSubject={selectedSubjectForHistory}
        studySessions={activeSessions}
        setEditingSession={setEditingSession}
        setIsSessionModalOpen={setIsSessionModalOpen}
        setConfirmationDialog={setConfirmationDialog}
        handleDeleteSession={handleDeleteSession}
      />

      {/* Global Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))}
        isDanger={true}
      />

    </div>
  );
};
