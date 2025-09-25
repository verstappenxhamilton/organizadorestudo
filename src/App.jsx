import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Eye,
  Clock,
  Activity,
  Target,
  Percent,
  Upload,
  CalendarClock,
  AlertTriangle,
  CalendarDays,
  ChevronRight
} from 'lucide-react';

// Importar componentes
import { ProfileModal, SubjectModal, ItemDetailsModal, SyllabusModal, ProgressReportModal, SessionHistoryModal } from './components/Modals';
import { SessionModal } from './components/SessionModal';
import { SubjectsOverview } from './components/SubjectsOverview';
import { SubjectsManagement } from './components/SubjectsManagement';
import { AppHeader } from './components/Header';
import { Calendar } from './components/Calendar';
import ContestComparison from './components/ContestComparison';
import { fetchGlobalEditais } from './services/globalEditaisService';
import GlobalConcursosCard from './components/dashboard/GlobalConcursosCard';
import ImportConcursoModal from './components/import/ImportConcursoModal';

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

  const [studyProfiles, setStudyProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [syllabusItems, setSyllabusItems] = useState([]);
  // Simulados (objetivos e subjetivos)
  const [simulados, setSimulados] = useState([]); // {id, profileId, tipo:'objetivo'|'subjetivo', data, quantidadeQuestoes, quantidadeObjetivasCorretas?, notaSubjetiva?, notaFinal, observacoes}
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState(null);
  // Editais globais carregados da página admin
  const [globalEditais, setGlobalEditais] = useState([]);
  const [isImportEditalOpen, setIsImportEditalOpen] = useState(false);
  const [isImportConcursoOpen, setIsImportConcursoOpen] = useState(false);

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
  // Concursos globais para comparação
  const [concursosGlobais, setConcursosGlobais] = useState([]);
  const [selectedConcursoForImport, setSelectedConcursoForImport] = useState(null);

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
  simulados,
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
    <div className="loading-state">
      <div className="loading-spinner" />
      <div className="loading-copy">
        <p className="loading-message">{loadingMessage}</p>
        <p className="loading-subtext">Preparando seu ambiente de estudos personalizado...</p>
      </div>
    </div>
  );

  // Componente de Breadcrumb
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
  const savedSimulados = loadFromLocalStorage('simulados') || [];
  const savedGlobalEditais = loadFromLocalStorage('globalEditais') || [];

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
  setSimulados(savedSimulados);
  setGlobalEditais(savedGlobalEditais);

        setLoadingMessage('Finalizando...');
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        showToast('Erro ao carregar dados', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    // Carregar concursos globais em paralelo (não bloqueante)
    (async ()=>{
      const concursos = await fetchGlobalEditais();
      setConcursosGlobais(concursos);
    })();
  }, []);

  // Filtrar dados por perfil ativo
  const activeSubjects = subjects.filter(subject => subject.profileId === activeProfileId);
  const activeSessions = studySessions.filter(session => session.profileId === activeProfileId);
  const activeSimulados = simulados.filter(s => s.profileId === activeProfileId);
  const activeSyllabusItems = syllabusItems.filter(item =>
    activeSubjects.some(subject => subject.id === item.subjectId)
  );

  const activeProfile = studyProfiles.find(profile => profile.id === activeProfileId);
  const subjectLookup = new Map(activeSubjects.map(subject => [subject.id, subject]));
  const todayISO = new Date().toISOString().split('T')[0];

  const formatDateLabel = (dateString) => {
    if (!dateString) return '-';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = minutes / 60;
    if (hours >= 1) {
      return `${hours.toFixed(1)}h`;
    }
    return `${Math.round(minutes)}min`;
  };

  const getSubjectLabel = (subjectId) => subjectLookup.get(subjectId)?.name || 'Sem matéria';

  const totalHoursStudied = activeSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60;
  const totalItems = activeSyllabusItems.length;
  const studiedItems = activeSyllabusItems.filter(item => item.isStudied).length;
  const studiedPercentage = totalItems > 0 ? (studiedItems / totalItems) * 100 : 0;
  const nextReviewLabel = getNextReviewDate();

  const overviewStats = [
    {
      label: 'Horas estudadas',
      value: `${totalHoursStudied.toFixed(1)}h`,
      description: 'Tempo total dedicado ao concurso atual.',
      icon: Clock
    },
    {
      label: 'Sessões registradas',
      value: activeSessions.length,
      description: 'Sprints de estudo concluídos.',
      icon: Activity
    },
    {
      label: 'Simulados feitos',
      value: activeSimulados.length,
      description: 'Simulados cadastrados para este concurso.',
      icon: Target
    },
    {
      label: 'Progresso do edital',
      value: `${Math.round(studiedPercentage)}%`,
      description: `${studiedItems}/${totalItems || 0} itens concluídos.`,
      icon: Percent
    },
    {
      label: 'Próxima revisão',
      value: nextReviewLabel,
      description: 'Data sugerida conforme seu ciclo de revisões.',
      icon: CalendarClock
    }
  ];

  const urgentReviewItems = getUrgentReviews().slice(0, 5);
  const upcomingSessions = [...activeSessions]
    .filter(session => session.date && session.date >= todayISO)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);
  const upcomingSimulados = [...activeSimulados]
    .filter(simulado => simulado.data)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 3);

  // Renderização condicional baseada no estado de carregamento
  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="app-shell__gradient" />
        <div className="app-shell__grid" />
        <div className="app-shell__blur app-shell__blur--1" />
        <div className="app-shell__blur app-shell__blur--2" />
        <div className="app-shell__content flex items-center justify-center">
          <div className="card w-full max-w-md p-10 text-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Interface principal
  return (
    <>
      <div className="app-shell">
        <div className="app-shell__gradient" />
        <div className="app-shell__grid" />
        <div className="app-shell__blur app-shell__blur--1" />
        <div className="app-shell__blur app-shell__blur--2" />
        <div className="app-shell__content space-y-8">
        <AppHeader
          setIsProgressReportModalOpen={setIsProgressReportModalOpen}
          handleExportData={handleExportData}
          handleImportData={handleImportData}
          studyProfiles={studyProfiles}
          activeProfileId={activeProfileId}
          setActiveProfileId={handleSetActiveProfile}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {!activeProfileId ? (
          <div className="card space-y-4 p-10 text-center">
            <h2 className="text-2xl font-semibold text-white">Comece seu planejamento</h2>
            <p className="text-sm text-slate-300">
              Crie um concurso para visualizar estatísticas, metas e revisões em um único painel.
            </p>
            <div className="flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <PlusCircle size={18} />
                Criar primeiro concurso
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <section className="space-y-6">
              <div className="card space-y-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.35em] text-sky-100/70">Visão geral</span>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                      {activeProfile?.name || 'Seu concurso'}
                    </h2>
                    <p className="mt-3 text-sm text-slate-300">
                      {activeProfile?.description
                        ? activeProfile.description
                        : 'Acompanhe horas estudadas, simulados e revisões em um único lugar.'}
                    </p>
                  </div>
                  {activeProfile?.examDate && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right">
                      <span className="text-xs uppercase tracking-wide text-slate-400">Data da prova</span>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {new Date(activeProfile.examDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {overviewStats.map(({ label, value, description, icon: Icon }) => (
                    <div key={label} className="stat-card modern-stat">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sky-200">
                          <Icon size={18} />
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                    onClick={() => {
                      setEditingSession(null);
                      setCurrentSubjectForSession(null);
                      setInitialSessionData(null);
                      setIsSessionModalOpen(true);
                    }}
                  >
                    <CalendarDays size={16} />
                    Registrar sessão
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    onClick={() => setIsSubjectModalOpen(true)}
                  >
                    <PlusCircle size={16} />
                    Nova matéria
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    onClick={() => setIsSimuladoModalOpen(true)}
                  >
                    <Target size={16} />
                    Registrar simulado
                  </button>
                  {globalEditais.length > 0 && activeSubjects.length > 0 && (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      onClick={() => setIsImportEditalOpen(true)}
                    >
                      <Upload size={16} />
                      Importar edital
                    </button>
                  )}
                </div>

                {activeSubjects.length > 0 && (
                  <div className="study-cycle-indicator">
                    <div className="study-cycle-header">
                      <span className="study-cycle-icon">🔄</span>
                      <span className="study-cycle-title">Distribuição do ciclo de estudos</span>
                    </div>
                    <div className="study-cycle-subjects">
                      {activeSubjects.map(subject => (
                        <div
                          key={subject.id}
                          className="study-cycle-item"
                          style={{
                            backgroundColor: `${subject.color || '#38bdf8'}20`,
                            borderLeft: `3px solid ${subject.color || '#38bdf8'}`
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
                <div className="card space-y-4 p-10 text-center">
                  <h3 className="text-xl font-semibold text-white">Nenhuma matéria cadastrada</h3>
                  <p className="text-sm text-slate-300">Adicione sua primeira matéria para liberar o ciclo de estudos.</p>
                  <div className="flex justify-center">
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                      onClick={() => setIsSubjectModalOpen(true)}
                    >
                      <PlusCircle size={16} />
                      Adicionar matéria
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card p-6 sm:p-8">
                    <Calendar
                      studySessions={activeSessions}
                      syllabusItems={activeSyllabusItems}
                      onDateClick={() => {}}
                    />
                  </div>

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

                  <div className="card space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-300">Edital</span>
                        <h2 className="mt-1 text-xl font-semibold text-white">Visão geral das matérias</h2>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {studiedItems}/{totalItems || 0} itens mapeados
                      </span>
                    </div>
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

                  <GlobalConcursosCard
                    concursos={concursosGlobais}
                    syllabusItems={syllabusItems}
                    onImport={(id) => {
                      setIsImportConcursoOpen(true);
                      setSelectedConcursoForImport(id);
                    }}
                  />

                  {concursosGlobais.length > 1 && (
                    <div className="card space-y-4 p-6 sm:p-8">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Eye size={18} />
                        <h3 className="text-lg font-semibold text-white">Comparação de editais</h3>
                      </div>
                      <ContestComparison concursos={concursosGlobais} />
                    </div>
                  )}
                </>
              )}
            </section>

            <aside className="space-y-6">
              <div className="card space-y-4 p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-amber-200/80">Prioridades</span>
                    <h3 className="mt-1 text-lg font-semibold text-white">Revisões urgentes</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200">
                    <AlertTriangle size={14} />
                    {urgentReviewItems.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {urgentReviewItems.length > 0 ? (
                    urgentReviewItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">{getSubjectLabel(item.subjectId)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-200">
                          <CalendarClock size={12} />
                          {formatDateLabel(item.nextReviewDate)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-white/5 bg-white/5 px-3 py-4 text-sm text-slate-300">
                      Nenhuma revisão urgente no momento. Continue avançando! ✨
                    </p>
                  )}
                </div>
              </div>

              <div className="card space-y-4 p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-sky-200/80">Planejamento</span>
                    <h3 className="mt-1 text-lg font-semibold text-white">Próximas sessões</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{getSubjectLabel(session.subjectId)}</p>
                          <p className="text-xs text-slate-400">
                            {formatDateLabel(session.date)} • {formatDuration(session.duration)}
                          </p>
                          {session.topics && (
                            <p className="mt-1 text-xs text-slate-500">{session.topics}</p>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-slate-500" />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-4 text-sm text-slate-300">
                      Nenhuma sessão futura registrada.
                      <button
                        className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/20"
                        onClick={() => {
                          setEditingSession(null);
                          setCurrentSubjectForSession(null);
                          setInitialSessionData(null);
                          setIsSessionModalOpen(true);
                        }}
                      >
                        <CalendarDays size={14} />
                        Planejar agora
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="card space-y-4 p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-slate-300">Preparação</span>
                    <h3 className="mt-1 text-lg font-semibold text-white">Próximos simulados</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {upcomingSimulados.length > 0 ? (
                    upcomingSimulados.map(simulado => (
                      <div key={simulado.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{formatDateLabel(simulado.data)}</p>
                            <p className="text-xs text-slate-400 capitalize">{simulado.tipo || 'Simulado'}</p>
                          </div>
                          <Target size={18} className="text-sky-200" />
                        </div>
                        {simulado.notaFinal !== undefined && simulado.notaFinal !== null && (
                          <p className="mt-2 text-xs text-slate-300">Nota final: {simulado.notaFinal}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-4 text-sm text-slate-300">
                      Nenhum simulado agendado.
                      <button
                        className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                        onClick={() => setIsSimuladoModalOpen(true)}
                      >
                        <Target size={14} />
                        Criar simulado
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
      </div>

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
      {isSimuladoModalOpen && (
        <div className="modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget){ setIsSimuladoModalOpen(false); setEditingSimulado(null);} }}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h2>{editingSimulado ? 'Editar Simulado' : 'Registrar Simulado'}<button className="close-btn" onClick={()=>{setIsSimuladoModalOpen(false); setEditingSimulado(null);}}>×</button></h2>
            <SimuladoForm
              simulados={simulados}
              setSimulados={setSimulados}
              editingSimulado={editingSimulado}
              setEditingSimulado={setEditingSimulado}
              activeProfileId={activeProfileId}
              onClose={()=>{setIsSimuladoModalOpen(false); setEditingSimulado(null);}}
              showToast={showToast}
            />
          </div>
        </div>
      )}
      {isImportEditalOpen && (
        <div className="modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget){ setIsImportEditalOpen(false);} }}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h2>Importar Itens de Edital<button className="close-btn" onClick={()=>setIsImportEditalOpen(false)}>×</button></h2>
            <ImportEditalForm
              globalEditais={globalEditais}
              subjects={activeSubjects}
              syllabusItems={syllabusItems}
              setSyllabusItems={setSyllabusItems}
              onClose={()=>setIsImportEditalOpen(false)}
              showToast={showToast}
            />
          </div>
        </div>
      )}
      {isImportConcursoOpen && (
        <div className="modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget){ setIsImportConcursoOpen(false); setSelectedConcursoForImport(null);} }}>
          <div className="modal max-w-3xl w-full" onClick={(e)=>e.stopPropagation()}>
            <h2>Importar Concurso Estruturado<button className="close-btn" onClick={()=>{setIsImportConcursoOpen(false); setSelectedConcursoForImport(null);}}>×</button></h2>
            <ImportConcursoModal
              concursos={concursosGlobais}
              concursoId={selectedConcursoForImport}
              subjects={activeSubjects}
              setSubjects={(subs)=>{ setSubjects(prev=>{ const merged=[...subs]; return merged; }); }}
              syllabusItems={syllabusItems}
              setSyllabusItems={setSyllabusItems}
              onClose={()=>{setIsImportConcursoOpen(false); setSelectedConcursoForImport(null);}}
              showToast={showToast}
              activeProfileId={activeProfileId}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;

// Componente interno para formulário de Simulado
function SimuladoForm({ simulados, setSimulados, editingSimulado, setEditingSimulado, activeProfileId, onClose, showToast }) {
  const [tipo, setTipo] = useState(editingSimulado?.tipo || 'objetivo');
  const [data, setData] = useState(editingSimulado?.data || new Date().toISOString().split('T')[0]);
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(editingSimulado?.quantidadeQuestoes || '');
  const [acertosObjetivas, setAcertosObjetivas] = useState(editingSimulado?.acertosObjetivas || '');
  const [notaSubjetiva, setNotaSubjetiva] = useState(editingSimulado?.notaSubjetiva || '');
  const [observacoes, setObservacoes] = useState(editingSimulado?.observacoes || '');

  const calcularNotaFinal = () => {
    if (tipo === 'objetivo') {
      const q = parseFloat(quantidadeQuestoes);
      const a = parseFloat(acertosObjetivas);
      if (!isNaN(q) && q > 0 && !isNaN(a)) {
        return ((a / q) * 100).toFixed(2);
      }
      return '';
    } else {
      return notaSubjetiva;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const notaFinal = calcularNotaFinal();
    if (!activeProfileId) { showToast('Selecione um perfil', 'error'); return; }
    if (tipo === 'objetivo' && (!quantidadeQuestoes || !acertosObjetivas)) { showToast('Informe questões e acertos', 'error'); return; }
    if (tipo === 'subjetivo' && !notaSubjetiva) { showToast('Informe a nota', 'error'); return; }

    if (editingSimulado) {
      const updated = simulados.map(s => s.id === editingSimulado.id ? { ...s, tipo, data, quantidadeQuestoes: quantidadeQuestoes? Number(quantidadeQuestoes): null, acertosObjetivas: acertosObjetivas? Number(acertosObjetivas): null, notaSubjetiva: notaSubjetiva? Number(notaSubjetiva): null, notaFinal: notaFinal? Number(notaFinal): null, observacoes } : s);
      setSimulados(updated);
      saveToLocalStorage('simulados', updated);
      showToast('Simulado atualizado', 'success');
    } else {
      const novo = { id: Date.now().toString(), profileId: activeProfileId, tipo, data, quantidadeQuestoes: quantidadeQuestoes? Number(quantidadeQuestoes): null, acertosObjetivas: acertosObjetivas? Number(acertosObjetivas): null, notaSubjetiva: notaSubjetiva? Number(notaSubjetiva): null, notaFinal: notaFinal? Number(notaFinal): null, observacoes, createdAt: new Date().toISOString() };
      const updated = [...simulados, novo];
      setSimulados(updated);
      saveToLocalStorage('simulados', updated);
      showToast('Simulado registrado', 'success');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <select value={tipo} onChange={e=>setTipo(e.target.value)} className="form-input">
          <option value="objetivo">Objetivo</option>
          <option value="subjetivo">Subjetivo</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Data</label>
        <input type="date" value={data} onChange={e=>setData(e.target.value)} className="form-input" />
      </div>
      {tipo === 'objetivo' && (
        <>
          <div className="form-group">
            <label className="form-label">Quantidade de Questões</label>
            <input type="number" value={quantidadeQuestoes} onChange={e=>setQuantidadeQuestoes(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Acertos</label>
            <input type="number" value={acertosObjetivas} onChange={e=>setAcertosObjetivas(e.target.value)} className="form-input" />
          </div>
        </>
      )}
      {tipo === 'subjetivo' && (
        <div className="form-group">
          <label className="form-label">Nota Subjetiva (0-100 ou escala utilizada)</label>
          <input type="number" value={notaSubjetiva} onChange={e=>setNotaSubjetiva(e.target.value)} className="form-input" />
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Observações</label>
        <textarea value={observacoes} onChange={e=>setObservacoes(e.target.value)} className="form-input" rows={3} />
      </div>
      <div className="form-group">
        <label className="form-label">Nota Final</label>
        <input type="text" value={calcularNotaFinal()} readOnly className="form-input bg-slate-100" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
        <button type="submit" className="btn btn-primary">{editingSimulado ? 'Salvar' : 'Registrar'}</button>
      </div>
    </form>
  );
}

function ImportEditalForm({ globalEditais, subjects, syllabusItems, setSyllabusItems, onClose, showToast }) {
  const [selectedEditalId, setSelectedEditalId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [applyPrefix, setApplyPrefix] = useState(false);
  const [prefixText, setPrefixText] = useState('');

  const edital = globalEditais.find(e=>e.id===selectedEditalId);

  const handleImport = () => {
    if (!edital || !selectedSubjectId) { showToast('Selecione edital e matéria', 'error'); return; }
    const baseItems = edital.itens || [];
    const newItems = baseItems.map(it => ({
      id: Date.now().toString()+Math.random().toString(36).slice(2),
      subjectId: selectedSubjectId,
      name: (applyPrefix && prefixText? prefixText + ' ' : '') + it.name,
      isStudied: false,
      createdAt: new Date().toISOString()
    }));
    const updated = [...syllabusItems, ...newItems];
    setSyllabusItems(updated);
    saveToLocalStorage('syllabusItems', updated);
    showToast(`${newItems.length} itens importados`, 'success');
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="form-group">
        <label className="form-label">Edital</label>
        <select className="form-input" value={selectedEditalId} onChange={e=>setSelectedEditalId(e.target.value)}>
          <option value="">Selecione...</option>
          {globalEditais.map(e=> <option key={e.id} value={e.id}>{e.nome} ({e.itens.length})</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Matéria Destino</label>
        <select className="form-input" value={selectedSubjectId} onChange={e=>setSelectedSubjectId(e.target.value)}>
          {subjects.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="form-group flex items-center gap-2">
        <input type="checkbox" checked={applyPrefix} onChange={e=>setApplyPrefix(e.target.checked)} />
        <span className="text-sm">Adicionar prefixo aos itens</span>
      </div>
      {applyPrefix && (
        <div className="form-group">
          <input type="text" className="form-input" placeholder="Prefixo (ex: TJ2025)" value={prefixText} onChange={e=>setPrefixText(e.target.value)} />
        </div>
      )}
      {edital && (
        <div className="text-xs text-slate-500 max-h-32 overflow-y-auto border p-2 rounded">
          Pré-visualização:
          <ul className="mt-1 space-y-1">
            {edital.itens.slice(0,10).map(it => <li key={it.id}>{(applyPrefix && prefixText? prefixText + ' ' : '') + it.name}</li>)}
            {edital.itens.length > 10 && <li className="italic">... (+{edital.itens.length - 10} itens)</li>}
          </ul>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleImport} disabled={!selectedEditalId || !selectedSubjectId}>Importar</button>
      </div>
    </div>
  );
}

