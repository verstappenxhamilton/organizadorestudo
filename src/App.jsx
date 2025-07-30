import React, { useState, useEffect } from 'react';
import { PlusCircle, BarChart3, Eye } from 'lucide-react';

// Importar componentes
import { ProfileModal, SubjectModal, ItemDetailsModal, SyllabusModal, ProgressReportModal, SessionHistoryModal } from './components/Modals';
import { SessionModal } from './components/SessionModal';
import { SubjectsOverview } from './components/SubjectsOverview';
import { SubjectsManagement } from './components/SubjectsManagement';
import { AppHeader, ProfileSection } from './components/Header';
import { Calendar } from './components/Calendar';

// Importar serviços
import { saveToLocalStorage, loadFromLocalStorage } from './utils/localStorage';

function App() {
  // Estados principais
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [selectedSyllabusItem, setSelectedSyllabusItem] = useState(null);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando dados...');
  const [currentView, setCurrentView] = useState('overview'); // 'overview', 'subjects', 'calendar', 'reports'

  const [studyProfiles, setStudyProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [syllabusItems, setSyllabusItems] = useState([]);

  // Estados dos modais
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentSubjectForSession, setCurrentSubjectForSession] = useState(null);
  const [initialSessionData, setInitialSessionData] = useState(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [currentSubjectForSyllabus, setCurrentSubjectForSyllabus] = useState(null);
  const [isProgressReportModalOpen, setIsProgressReportModalOpen] = useState(false);
  const [isSessionHistoryModalOpen, setIsSessionHistoryModalOpen] = useState(false);
  const [selectedSubjectForHistory, setSelectedSubjectForHistory] = useState(null);

  // Handlers para os modais
  const handleProfileSubmit = (formData) => {
    if (editingProfile) {
      handleUpdateProfile(editingProfile.id, formData);
    } else {
      handleCreateProfile(formData);
    }
  };

  const handleSubjectSubmit = (formData) => {
    if (editingSubject) {
      handleUpdateSubject(editingSubject.id, formData);
    } else {
      handleCreateSubject(formData);
    }
  };

  const handleSessionSubmit = (formData) => {
    if (editingSession) {
      handleUpdateSession(editingSession.id, formData);
    } else {
      handleCreateSession(formData);
    }
  };



  // Funções auxiliares
  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const getSubjectStudyTime = (subjectId) => {
    return studySessions
      .filter(session => session.subjectId === subjectId)
      .reduce((total, session) => total + (session.duration || 0), 0) / 60;
  };

  const calculateSubjectProgress = (subjectId) => {
    const subjectSyllabusItems = syllabusItems.filter(item => item.subjectId === subjectId);
    const studiedItems = subjectSyllabusItems.filter(item => item.isStudied);
    return subjectSyllabusItems.length > 0 ? (studiedItems.length / subjectSyllabusItems.length) * 100 : 0;
  };

  // Sistema de revisões melhorado
  const calculateNextReviewDate = (lastStudyDate, accuracy) => {
    const baseDate = new Date(lastStudyDate);
    let daysToAdd = 1; // Padrão: revisar no dia seguinte

    if (accuracy >= 90) {
      daysToAdd = 7; // 1 semana
    } else if (accuracy >= 80) {
      daysToAdd = 5; // 5 dias
    } else if (accuracy >= 70) {
      daysToAdd = 3; // 3 dias
    } else if (accuracy >= 60) {
      daysToAdd = 2; // 2 dias
    } else {
      daysToAdd = 1; // 1 dia
    }

    baseDate.setDate(baseDate.getDate() + daysToAdd);
    return baseDate.toISOString().split('T')[0];
  };

  const getUrgentReviews = () => {
    const today = new Date().toISOString().split('T')[0];
    return syllabusItems.filter(item =>
      item.nextReviewDate && item.nextReviewDate <= today
    );
  };

  const getNextReviewDate = () => {
    const urgentReviews = getUrgentReviews();
    if (urgentReviews.length > 0) {
      return 'Hoje';
    }

    const futureReviews = syllabusItems
      .filter(item => item.nextReviewDate && item.nextReviewDate > new Date().toISOString().split('T')[0])
      .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

    if (futureReviews.length > 0) {
      const nextDate = new Date(futureReviews[0].nextReviewDate);
      return nextDate.toLocaleDateString('pt-BR');
    }

    return '-';
  };

  // Função para alterar perfil ativo
  const handleSetActiveProfile = (profileId) => {
    setActiveProfileId(profileId);
    saveToLocalStorage('activeProfileId', profileId);
  };

  // Placeholder functions
  const handleCreateProfile = (formData) => {
    const newProfile = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    const updatedProfiles = [...studyProfiles, newProfile];
    setStudyProfiles(updatedProfiles);
    setActiveProfileId(newProfile.id); // Selecionar automaticamente o novo perfil

    // Salvar no localStorage
    saveToLocalStorage('studyProfiles', updatedProfiles);
    saveToLocalStorage('activeProfileId', newProfile.id);

    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast('Perfil criado e selecionado com sucesso!', 'success');
  };

  const handleUpdateProfile = (id, formData) => {
    const updatedProfiles = studyProfiles.map(profile =>
      profile.id === id ? { ...profile, ...formData } : profile
    );
    setStudyProfiles(updatedProfiles);

    // Salvar no localStorage
    saveToLocalStorage('studyProfiles', updatedProfiles);

    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast('Perfil atualizado com sucesso!', 'success');
  };

  const handleDeleteProfile = (id) => {
    const updatedProfiles = studyProfiles.filter(profile => profile.id !== id);
    setStudyProfiles(updatedProfiles);

    let newActiveProfileId = activeProfileId;
    if (activeProfileId === id) {
      newActiveProfileId = updatedProfiles.length > 0 ? updatedProfiles[0].id : null;
      setActiveProfileId(newActiveProfileId);
    }

    // Salvar no localStorage
    saveToLocalStorage('studyProfiles', updatedProfiles);
    saveToLocalStorage('activeProfileId', newActiveProfileId);

    showToast('Perfil deletado com sucesso!', 'success');
  };

  const handleCreateSubject = (formData) => {
    const newSubject = {
      id: Date.now().toString(),
      profileId: activeProfileId,
      ...formData,
      createdAt: new Date().toISOString()
    };
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    saveToLocalStorage('subjects', updatedSubjects);
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    showToast('Matéria criada com sucesso!', 'success');
  };

  const handleUpdateSubject = (id, formData) => {
    const updatedSubjects = subjects.map(subject =>
      subject.id === id ? { ...subject, ...formData } : subject
    );
    setSubjects(updatedSubjects);
    saveToLocalStorage('subjects', updatedSubjects);
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    showToast('Matéria atualizada com sucesso!', 'success');
  };

  const handleDeleteSubject = (id) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== id);
    const updatedSyllabusItems = syllabusItems.filter(item => item.subjectId !== id);
    const updatedSessions = studySessions.filter(session => session.subjectId !== id);

    setSubjects(updatedSubjects);
    setSyllabusItems(updatedSyllabusItems);
    setStudySessions(updatedSessions);

    saveToLocalStorage('subjects', updatedSubjects);
    saveToLocalStorage('syllabusItems', updatedSyllabusItems);
    saveToLocalStorage('sessions', updatedSessions);

    showToast('Matéria deletada com sucesso!', 'success');
  };

  const handleCreateSession = (formData) => {
    const newSession = {
      id: Date.now().toString(),
      profileId: activeProfileId,
      ...formData,
      createdAt: new Date().toISOString()
    };
    const updatedSessions = [...studySessions, newSession];
    setStudySessions(updatedSessions);
    saveToLocalStorage('sessions', updatedSessions);
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setCurrentSubjectForSession(null);
    setInitialSessionData(null);
    showToast('Sessão registrada com sucesso!', 'success');
  };

  const handleUpdateSession = (id, formData) => {
    const updatedSessions = studySessions.map(session =>
      session.id === id ? { ...session, ...formData } : session
    );
    setStudySessions(updatedSessions);
    saveToLocalStorage('sessions', updatedSessions);
    setIsSessionModalOpen(false);
    setEditingSession(null);
    setCurrentSubjectForSession(null);
    setInitialSessionData(null);
    showToast('Sessão atualizada com sucesso!', 'success');
  };

  const handleExportData = () => {
    const data = {
      studyProfiles,
      subjects,
      studySessions,
      syllabusItems,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizador-estudos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Dados exportados com sucesso!', 'success');
  };

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);

        // Validar estrutura do backup
        if (!backupData.timestamp) {
          throw new Error('Arquivo de backup inválido');
        }

        // Mostrar aviso sobre criação de novo concurso
        setConfirmationDialog({
          isOpen: true,
          title: 'Importar Dados',
          message: 'A importação criará um novo concurso com os dados do arquivo JSON. Os dados atuais serão preservados. Deseja continuar?',
          onConfirm: () => {
            try {
              // Criar novo perfil com dados importados
              if (backupData.studyProfiles && backupData.studyProfiles.length > 0) {
                const importedProfile = backupData.studyProfiles[0];
                const newProfile = {
                  ...importedProfile,
                  id: Date.now().toString(),
                  name: `${importedProfile.name} (Importado)`
                };

                const updatedProfiles = [...studyProfiles, newProfile];
                setStudyProfiles(updatedProfiles);
                setActiveProfileId(newProfile.id);
                saveToLocalStorage('studyProfiles', updatedProfiles);
                saveToLocalStorage('activeProfileId', newProfile.id);

                // Importar outros dados se existirem
                if (backupData.subjects) {
                  setSubjects(backupData.subjects);
                  saveToLocalStorage('subjects', backupData.subjects);
                }

                if (backupData.sessions) {
                  setStudySessions(backupData.sessions);
                  saveToLocalStorage('sessions', backupData.sessions);
                }

                if (backupData.syllabusItems) {
                  setSyllabusItems(backupData.syllabusItems);
                  saveToLocalStorage('syllabusItems', backupData.syllabusItems);
                }

                showToast("Dados importados com sucesso! Novo concurso criado.", "success");
              } else {
                showToast("Nenhum perfil encontrado no arquivo", "error");
              }
            } catch (error) {
              showToast("Erro ao processar dados importados", "error");
            }
            setConfirmationDialog({ ...confirmationDialog, isOpen: false });
          }
        });
      } catch (error) {
        showToast('Erro ao ler arquivo JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Componente de Loading
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-message">{loadingMessage}</p>
      <div className="loading-progress">
        <div className="loading-bar"></div>
      </div>
    </div>
  );

  // Componente de Breadcrumb
  const Breadcrumb = () => {
    const activeProfile = studyProfiles.find(p => p.id === activeProfileId);
    const viewNames = {
      overview: 'Visão Geral',
      subjects: 'Matérias',
      calendar: 'Calendário',
      reports: 'Relatórios'
    };

    return (
      <div className="breadcrumb">
        <span className="breadcrumb-item">
          📚 {activeProfile?.name || 'Nenhum Concurso'}
        </span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">
          {viewNames[currentView]}
        </span>
      </div>
    );
  };

  // Componente de Estatísticas Rápidas
  const QuickStats = () => {
    const totalSubjects = activeSubjects.length;
    const totalItems = activeSyllabusItems.length;
    const studiedItems = activeSyllabusItems.filter(item => item.isStudied).length;
    const studiedPercentage = totalItems > 0 ? ((studiedItems / totalItems) * 100).toFixed(0) : 0;
    const totalHours = activeSessions.reduce((sum, session) => sum + session.duration, 0);

    return (
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-value">{totalSubjects}</span>
          <span className="stat-label">Matérias</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{studiedPercentage}%</span>
          <span className="stat-label">Progresso</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalHours.toFixed(1)}h</span>
          <span className="stat-label">Estudadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{studiedItems}/{totalItems}</span>
          <span className="stat-label">Itens</span>
        </div>
      </div>
    );
  };

  // Componente de Toast Melhorado
  const Toast = ({ message, type, isVisible }) => {
    if (!isVisible) return null;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return (
      <div className={`toast toast-${type}`}>
        <span className="toast-icon">{icons[type] || icons.info}</span>
        <span className="toast-message">{message}</span>
      </div>
    );
  };

  // Componente de Confirmação
  const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>{title}</h2>
          <div className="p-6">
            <p style={{ color: '#e2e8f0', marginBottom: '20px' }}>{message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={onConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Carregamento inicial com sistema duplo de armazenamento
  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + N = Novo Perfil
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsProfileModalOpen(true);
      }
      // Ctrl/Cmd + R = Relatório
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setIsProgressReportModalOpen(true);
      }
      // Ctrl/Cmd + E = Exportar
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportData();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Inicializando aplicativo...');

        // Simular carregamento com mensagens
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoadingMessage('Carregando perfis...');

        // Carregar dados do localStorage
        const savedProfiles = loadFromLocalStorage('studyProfiles') || [];
        const savedActiveProfileId = loadFromLocalStorage('activeProfileId') || null;

        await new Promise(resolve => setTimeout(resolve, 200));
        setLoadingMessage('Carregando matérias...');
        const savedSubjects = loadFromLocalStorage('subjects') || [];
        const savedSessions = loadFromLocalStorage('sessions') || [];
        const savedSyllabusItems = loadFromLocalStorage('syllabusItems') || [];

        // Carregar perfis
        if (savedProfiles.length > 0) {
          setStudyProfiles(savedProfiles);
          // Definir perfil ativo
          if (savedActiveProfileId && savedProfiles.some(p => p.id === savedActiveProfileId)) {
            setActiveProfileId(savedActiveProfileId);
          } else {
            setActiveProfileId(savedProfiles[0].id);
          }
        }

        // Se não há dados salvos, usar dados de exemplo
        if (savedSubjects.length === 0) {
          const demoSubjects = [
            {
              id: '1',
              name: 'Matemática',
              color: '#3B82F6',
              weight: 3,
              accuracy: 75,
              syllabus: [
                { id: '1', name: 'Álgebra', isCompleted: false },
                { id: '2', name: 'Geometria', isCompleted: true },
                { id: '3', name: 'Trigonometria', isCompleted: false }
              ]
            },
            {
              id: '2',
              name: 'Português',
              color: '#10B981',
              weight: 2,
              accuracy: 80,
              syllabus: [
                { id: '4', name: 'Gramática', isCompleted: true },
                { id: '5', name: 'Literatura', isCompleted: false }
              ]
            }
          ];

          setSubjects(demoSubjects);
          saveToLocalStorage('subjects', demoSubjects);
        } else {
          setSubjects(savedSubjects);
        }

        if (savedSessions.length === 0) {
          const demoSessions = [
            {
              id: '1',
              subjectId: '1',
              subjectName: 'Matemática',
              date: '2025-01-26',
              duration: 2,
              syllabusItemId: '1',
              syllabusItemName: 'Álgebra',
              accuracy: 75,
              observations: 'Estudei equações do segundo grau'
            }
          ];

          setStudySessions(demoSessions);
          saveToLocalStorage('sessions', demoSessions);
        } else {
          setStudySessions(savedSessions);
        }

        // Carregar syllabusItems
        setSyllabusItems(savedSyllabusItems);

        setLoadingMessage('Finalizando...');
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Filtrar dados por perfil ativo
  const activeSubjects = subjects.filter(subject => subject.profileId === activeProfileId);
  const activeSessions = studySessions.filter(session => session.profileId === activeProfileId);
  const activeSyllabusItems = syllabusItems.filter(item => 
    activeSubjects.some(subject => subject.id === item.subjectId)
  );

  // Renderização condicional baseada no estado de carregamento
  if (isLoading) {
    return (
      <div className="app-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Interface principal
  return (
    <div className="app-container">
      {/* Header */}
      <AppHeader
        setIsProgressReportModalOpen={setIsProgressReportModalOpen}
        handleExportData={handleExportData}
        handleImportData={handleImportData}
        studyProfiles={studyProfiles}
        activeProfileId={activeProfileId}
        setActiveProfileId={handleSetActiveProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Breadcrumb e Estatísticas */}
      {activeProfileId && (
        <div className="navigation-section">
          <Breadcrumb />
          <QuickStats />
        </div>
      )}

      {/* Conteúdo Principal */}
      {!activeProfileId ? (
        <div className="card">
          <div className="welcome-section">
            <h2>Bem-vindo ao Organizador de Estudos!</h2>
            <p>Crie ou selecione um perfil de concurso para começar a organizar seus estudos.</p>
            <button
              className="btn btn-primary"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <PlusCircle size={20} />
              Criar Primeiro Perfil
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Estatísticas Rápidas */}
          <div className="card">
            <h2>
              <BarChart3 size={20} />
              Estatísticas Rápidas
            </h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{activeSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60}h</div>
                <div className="stat-label">Total Estudado</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{activeSessions.length}</div>
                <div className="stat-label">Sessões Registradas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {activeSyllabusItems.length > 0 
                    ? (activeSyllabusItems.reduce((sum, item) => sum + (item.accuracy || 0), 0) / activeSyllabusItems.length).toFixed(0)
                    : 0}%
                </div>
                <div className="stat-label">Média de Acerto Geral</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{getNextReviewDate()}</div>
                <div className="stat-label">Próxima Revisão Urgente</div>
              </div>
            </div>

            {/* Ciclo de Estudos Visual */}
            {activeSubjects.length > 0 && (
              <div className="study-cycle-indicator">
                <div className="study-cycle-header">
                  <span className="study-cycle-icon">🔄</span>
                  <span className="study-cycle-title">Ciclo de Estudos Visual</span>
                </div>
                <div className="study-cycle-subjects">
                  {activeSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="study-cycle-item"
                      style={{
                        backgroundColor: subject.color + '20',
                        borderLeft: `3px solid ${subject.color}`
                      }}
                    >
                      <span className="cycle-subject-name">{subject.name}</span>
                      <span className="cycle-subject-weight">Peso: {subject.weight || 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeSubjects.length === 0 ? (
            <div className="card">
              <div className="welcome-section">
                <h2>Nenhuma matéria cadastrada</h2>
                <p>Adicione sua primeira matéria para começar a organizar seus estudos.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsSubjectModalOpen(true)}
                >
                  <PlusCircle size={20} />
                  Adicionar Primeira Matéria
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Calendário de Estudos */}
              <div className="card">
                <Calendar
                  studySessions={activeSessions}
                  syllabusItems={activeSyllabusItems}
                  onDateClick={(date) => {
                    // Aqui pode abrir um modal com detalhes do dia
                  }}
                />
              </div>

              {/* Matérias (Gerenciamento) */}
              <SubjectsManagement
                subjects={activeSubjects}
                studySessions={activeSessions}
                setIsSubjectModalOpen={setIsSubjectModalOpen}
                setCurrentSubjectForSession={setCurrentSubjectForSession}
                setIsSessionModalOpen={setIsSessionModalOpen}
                setCurrentSubjectForSyllabus={setCurrentSubjectForSyllabus}
                setIsSyllabusModalOpen={setIsSyllabusModalOpen}
                setEditingSubject={setEditingSubject}
                setConfirmationDialog={setConfirmationDialog}
                handleDeleteSubject={handleDeleteSubject}
                getSubjectStudyTime={getSubjectStudyTime}
                calculateSubjectProgress={calculateSubjectProgress}
                setIsSessionHistoryModalOpen={setIsSessionHistoryModalOpen}
                setSelectedSubjectForHistory={setSelectedSubjectForHistory}
              />

              {/* Visão Geral das Matérias e Edital */}
              <div className="card">
                <h2>
                  <Eye size={20} />
                  Visão Geral das Matérias e Edital
                </h2>
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
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Modais */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setEditingProfile(null);
        }}
        editingProfile={editingProfile}
        onSubmit={handleProfileSubmit}
        showToast={showToast}
      />
      
      <SubjectModal 
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
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
        onClose={() => {
          setIsItemDetailsModalOpen(false);
          setSelectedSyllabusItem(null);
        }}
        selectedItem={selectedSyllabusItem}
        subjects={activeSubjects}
        studySessions={activeSessions}
      />

      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => {
          setIsSyllabusModalOpen(false);
          setCurrentSubjectForSyllabus(null);
        }}
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
        onClose={() => {
          setIsSessionHistoryModalOpen(false);
          setSelectedSubjectForHistory(null);
        }}
        selectedSubject={selectedSubjectForHistory}
        studySessions={activeSessions}
        setEditingSession={setEditingSession}
        setIsSessionModalOpen={setIsSessionModalOpen}
        setConfirmationDialog={setConfirmationDialog}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />

      {/* Confirmação */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />
    </div>
  );
}

export default App;
