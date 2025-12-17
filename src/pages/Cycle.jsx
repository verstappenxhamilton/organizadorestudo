import React, { useState } from 'react';
import { useStudyContext } from '../context/StudyContext';
import { StudyCycle as CycleComponent } from '../components/StudyCycle';
import { SessionModal } from '../components/SessionModal';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

export const Cycle = () => {
  const {
    activeSubjects,
    activeSyllabusItems,
    activeProfileId,
    setSyllabusItems,
    addOrUpdateSession,
    showToast
  } = useStudyContext();

  const [cycleAdvanceNonce, setCycleAdvanceNonce] = useState(0);
  const [cycleSessionContext, setCycleSessionContext] = useState(null);

  // Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [currentSubjectForSession, setCurrentSubjectForSession] = useState(null);
  const [initialSessionData, setInitialSessionData] = useState(null);

  const handleSessionSubmit = (data) => {
    addOrUpdateSession(data);
    setIsSessionModalOpen(false);

    if (cycleSessionContext) {
      setCycleAdvanceNonce((prev) => prev + 1);
    }
    setCycleSessionContext(null);
    showToast("Sessão registrada e ciclo atualizado!", "success");
  };

  return (
    <div className="animate-enter space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Ciclo de Estudos</h1>
        <p className="text-slate-400">Siga o roteiro automático de estudos.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <CycleComponent
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
      </div>

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setCycleSessionContext(null);
        }}
        initialSessionData={initialSessionData}
        currentSubjectForSession={currentSubjectForSession}
        subjects={activeSubjects}
        syllabusItems={activeSyllabusItems}
        onSubmit={handleSessionSubmit}
        showToast={showToast}
      />
    </div>
  );
};
