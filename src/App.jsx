import React, { useState, useEffect } from 'react';
import { PlusCircle, PlayCircle, BookOpen } from 'lucide-react';

// Componentes
import { ProfileModal, SubjectModal, ItemDetailsModal, SyllabusModal, ProgressReportModal, SessionHistoryModal } from './components/Modals';
import { SessionModal } from './components/SessionModal';
import { SubjectsOverview } from './components/SubjectsOverview';
import { AppHeader } from './components/Header';
import { Calendar } from './components/Calendar';

// Serviços
import { saveToLocalStorage, loadFromLocalStorage } from './utils/localStorage';

function App() {
  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [confirmationDialog, setConfirmationDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  // Data State
  const [studyProfiles, setStudyProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [syllabusItems, setSyllabusItems] = useState([]);

  // UI State
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSyllabusItem, setSelectedSyllabusItem] = useState(null);
  
  // Modals State
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
  
  // Context State
  const [currentSubjectForSession, setCurrentSubjectForSession] = useState(null);
  const [currentSubjectForSyllabus, setCurrentSubjectForSyllabus] = useState(null);
  const [selectedSubjectForHistory, setSelectedSubjectForHistory] = useState(null);
  const [initialSessionData, setInitialSessionData] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        // Load Data
        const savedProfiles = loadFromLocalStorage('studyProfiles') || [];
        const savedActiveProfileId = loadFromLocalStorage('activeProfileId');
        const savedSubjects = loadFromLocalStorage('subjects') || [];
        const savedSessions = loadFromLocalStorage('sessions') || [];
        const savedSyllabusItems = loadFromLocalStorage('syllabusItems') || [];

        setStudyProfiles(savedProfiles);
        setSubjects(savedSubjects);
        setStudySessions(savedSessions);
        setSyllabusItems(savedSyllabusItems);

        if (savedProfiles.length > 0) {
          setActiveProfileId(savedActiveProfileId || savedProfiles[0].id);
        }
      } catch (error) {
        console.error("Init Error", error);
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // --- ACTIONS ---
  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  };

  const handleSetActiveProfile = (id) => {
    setActiveProfileId(id);
    saveToLocalStorage('activeProfileId', id);
  };

  // ... (CRUD Handlers kept same logic, just condensed for readability) ...
  const handleProfileSubmit = (data) => {
    const newProfiles = editingProfile 
      ? studyProfiles.map(p => p.id === editingProfile.id ? { ...p, ...data } : p)
      : [...studyProfiles, { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() }];
    
    setStudyProfiles(newProfiles);
    saveToLocalStorage('studyProfiles', newProfiles);
    if (!editingProfile) {
      setActiveProfileId(newProfiles[newProfiles.length-1].id);
      saveToLocalStorage('activeProfileId', newProfiles[newProfiles.length-1].id);
    }
    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast(`Perfil ${editingProfile ? 'atualizado' : 'criado'}!`, 'success');
  };

  const handleDeleteProfile = (id) => {
    const newProfiles = studyProfiles.filter(p => p.id !== id);
    setStudyProfiles(newProfiles);
    saveToLocalStorage('studyProfiles', newProfiles);
    if (activeProfileId === id) setActiveProfileId(newProfiles[0]?.id || null);
    showToast('Perfil excluído.', 'success');
  };

  const handleSubjectSubmit = (data) => {
    const newSubjects = editingSubject
      ? subjects.map(s => s.id === editingSubject.id ? { ...s, ...data } : s)
      : [...subjects, { id: Date.now().toString(), profileId: activeProfileId, ...data }];
    
    setSubjects(newSubjects);
    saveToLocalStorage('subjects', newSubjects);
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    showToast('Matéria salva!', 'success');
  };

  const handleDeleteSubject = (id) => {
    const newSubjects = subjects.filter(s => s.id !== id);
    setSubjects(newSubjects);
    saveToLocalStorage('subjects', newSubjects);
    // Cleanup related
    const newItems = syllabusItems.filter(i => i.subjectId !== id);
    setSyllabusItems(newItems);
    saveToLocalStorage('syllabusItems', newItems);
    const newSessions = studySessions.filter(s => s.subjectId !== id);
    setStudySessions(newSessions);
    saveToLocalStorage('sessions', newSessions);
    showToast('Matéria excluída.', 'success');
  };

  const handleSessionSubmit = (data) => {
    const newSessions = editingSession
      ? studySessions.map(s => s.id === editingSession.id ? { ...s, ...data } : s)
      : [...studySessions, { id: Date.now().toString(), profileId: activeProfileId, ...data }];
    
    setStudySessions(newSessions);
    saveToLocalStorage('sessions', newSessions);
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setCurrentSubjectForSession(null);
    showToast('Sessão registrada!', 'success');
  };

  const handleExportData = () => {
    const data = { studyProfiles, subjects, studySessions, syllabusItems, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-estudos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exportação concluída!', 'success');
  };

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.studyProfiles) {
          // Simplistic import logic for prototype
          setStudyProfiles(data.studyProfiles); setSubjects(data.subjects || []); 
          setStudySessions(data.sessions || []); setSyllabusItems(data.syllabusItems || []);
          saveToLocalStorage('studyProfiles', data.studyProfiles);
          saveToLocalStorage('subjects', data.subjects || []);
          saveToLocalStorage('sessions', data.sessions || []);
          saveToLocalStorage('syllabusItems', data.syllabusItems || []);
          showToast('Dados importados!', 'success');
        }
      } catch (err) { showToast('Erro na importação', 'error'); }
    };
    reader.readAsText(file);
  };

  // Helpers
  const getSubjectStudyTime = (id) => studySessions.filter(s => s.subjectId === id).reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
  const calculateSubjectProgress = (id) => {
    const items = syllabusItems.filter(i => i.subjectId === id);
    if (!items.length) return 0;
    return (items.filter(i => i.isStudied).length / items.length) * 100;
  };

  // --- RENDER ---
  if (isLoading) return <div className="loading-container"><div className="loading-spinner" /></div>;

  const activeSubjects = subjects.filter(s => s.profileId === activeProfileId);
  const activeSessions = studySessions.filter(s => s.profileId === activeProfileId);
  const activeSyllabusItems = syllabusItems.filter(i => activeSubjects.some(s => s.id === i.subjectId));

  return (
    <main className="dashboard-layout">
      {/* 1. Header Global */}
      <AppHeader
        setIsProgressReportModalOpen={setIsProgressReportModalOpen}
        handleExportData={handleExportData}
        handleImportData={handleImportData}
        studyProfiles={studyProfiles}
        activeProfileId={activeProfileId}
        setActiveProfileId={handleSetActiveProfile}
        onOpenProfileModal={() => { setEditingProfile(null); setIsProfileModalOpen(true); }}
      />

      {/* 2. Conteúdo Principal */}
      {!activeProfileId ? (
        <div className="ui-card p-8 text-center animate-enter">
          <BookOpen size={48} className="mx-auto text-blue-500 mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Bem-vindo ao seu Organizador</h2>
          <p className="text-gray-400 mb-6">Crie seu primeiro perfil de estudos para começar.</p>
          <button className="ui-btn ui-btn-primary" onClick={() => setIsProfileModalOpen(true)}>
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
                  onClick={() => { setCurrentSubjectForSession(null); setIsSessionModalOpen(true); }}
                >
                  <PlayCircle size={16} /> Registrar Sessão
                </button>
              </div>
            </div>

            {activeSubjects.length === 0 ? (
              <div className="ui-card p-8 text-center border-dashed border-2 border-slate-700 bg-transparent">
                <p className="text-gray-400 mb-4">Nenhuma matéria encontrada neste perfil.</p>
                <button className="ui-btn ui-btn-primary" onClick={() => setIsSubjectModalOpen(true)}>
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
          <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
            <Calendar
              studySessions={activeSessions}
              syllabusItems={activeSyllabusItems}
            />
          </section>
        </>
      )}

      {/* --- MODAIS E UTILITÁRIOS --- */}
      {toast.isVisible && (
        <div className={`toast toast-${toast.type} animate-enter fixed top-4 right-4 z-50`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {confirmationDialog.isOpen && (
        <div className="modal-overlay">
          <div className="modal p-6 max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">{confirmationDialog.title}</h3>
            <p className="text-gray-300 mb-6 text-sm">{confirmationDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button className="ui-btn ui-btn-secondary" onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}>Cancelar</button>
              <button className="ui-btn ui-btn-primary bg-red-600 hover:bg-red-700 border-none shadow-none" onClick={confirmationDialog.onConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Component Modals */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} editingProfile={editingProfile} onSubmit={handleProfileSubmit} showToast={showToast} />
      <SubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} editingSubject={editingSubject} onSubmit={handleSubjectSubmit} showToast={showToast} />
      <SessionModal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} editingSession={editingSession} initialSessionData={initialSessionData} currentSubjectForSession={currentSubjectForSession} subjects={activeSubjects} syllabusItems={activeSyllabusItems} onSubmit={handleSessionSubmit} showToast={showToast} />
      <ItemDetailsModal isOpen={isItemDetailsModalOpen} onClose={() => setIsItemDetailsModalOpen(false)} selectedItem={selectedSyllabusItem} subjects={activeSubjects} studySessions={activeSessions} />
      <SyllabusModal isOpen={isSyllabusModalOpen} onClose={() => setIsSyllabusModalOpen(false)} currentSubjectForSyllabus={currentSubjectForSyllabus} syllabusItems={activeSyllabusItems} setSyllabusItems={setSyllabusItems} showToast={showToast} />
      <ProgressReportModal isOpen={isProgressReportModalOpen} onClose={() => setIsProgressReportModalOpen(false)} subjects={activeSubjects} studySessions={activeSessions} syllabusItems={activeSyllabusItems} getSubjectStudyTime={getSubjectStudyTime} />
      <SessionHistoryModal isOpen={isSessionHistoryModalOpen} onClose={() => setIsSessionHistoryModalOpen(false)} selectedSubject={selectedSubjectForHistory} studySessions={activeSessions} setEditingSession={setEditingSession} setIsSessionModalOpen={setIsSessionModalOpen} setConfirmationDialog={setConfirmationDialog} />
    </main>
  );
}

export default App;