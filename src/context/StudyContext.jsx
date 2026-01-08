import React, { createContext, useContext, useState } from 'react';
import { useStudyData } from '../hooks/useStudyData';
import { useGlobalTimer } from '../hooks/useGlobalTimer';

const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  // Global Timer
  const globalTimer = useGlobalTimer();

  // Toast state managed locally in context to be available globally
  const [toast, setToast] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const studyData = useStudyData(showToast);

  // Derived state that is commonly used
  const activeSubjects = studyData.subjects.filter(
    (s) => s.profileId === studyData.activeProfileId,
  );
  const activeSessions = studyData.studySessions.filter(
    (s) => s.profileId === studyData.activeProfileId,
  );
  const activeSyllabusItems = studyData.syllabusItems.filter((i) =>
    activeSubjects.some((s) => s.id === i.subjectId),
  );

  const getSubjectStudyTime = (id) =>
    studyData.studySessions
      .filter((s) => s.subjectId === id)
      .reduce((acc, s) => acc + (s.duration || 0), 0) / 60;

  const calculateSubjectProgress = (id) => {
    const items = studyData.syllabusItems.filter((i) => i.subjectId === id);
    if (!items.length) return 0;
    return (items.filter((i) => i.isStudied).length / items.length) * 100;
  };

  return (
    <StudyContext.Provider value={{
      ...studyData,
      activeSubjects,
      activeSessions,
      activeSyllabusItems,
      getSubjectStudyTime,
      calculateSubjectProgress,
      showToast,
      toast,
      deleteSession: studyData.deleteSession,
      toggleGlobalEditalSelection: studyData.toggleGlobalEditalSelection,
      selectedGlobalEditalIds: studyData.selectedGlobalEditalIds,
      ...globalTimer // Expose timer methods and state directly
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudyContext = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudyContext must be used within a StudyProvider');
  }
  return context;
};
