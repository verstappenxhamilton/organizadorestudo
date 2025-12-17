import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  BarChart3,
  Download,
  Upload,
  BookOpen,
  Edit,
  Plus,
  Menu,
  X,
  CheckCircle2,
  ListChecks
} from 'lucide-react';

export const ProfileSection = ({ 
  studyProfiles,
  activeProfileId,
  setActiveProfileId,
  setIsProfileModalOpen,
  setEditingProfile,
  setConfirmationDialog,
  handleDeleteProfile
}) => {
  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-title">
          <Users size={20} />
          <span>Perfis de Concurso</span>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <PlusCircle size={14} />
          Novo Perfil
        </button>
      </div>

      {studyProfiles.length === 0 ? (
        <div className="profile-empty">
          <span>Nenhum perfil criado.</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsProfileModalOpen(true)}
          >
            Criar Primeiro Perfil
          </button>
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-selector">
            <label>Concurso Ativo:</label>
            <select
              value={activeProfileId || ''}
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="profile-dropdown"
            >
              <option value="">Selecione um perfil</option>
              {studyProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
          
          {activeProfileId && (
            <div className="profile-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const profile = studyProfiles.find(p => p.id === activeProfileId);
                  if (profile) {
                    setEditingProfile(profile);
                    setIsProfileModalOpen(true);
                  }
                }}
              >
                <Edit2 size={14} />
                Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setConfirmationDialog({
                    isOpen: true,
                    title: 'Confirmar Exclusão',
                    message: 'Tem certeza que deseja deletar este perfil? Todos os dados relacionados serão perdidos.',
                    onConfirm: () => {
                      handleDeleteProfile(activeProfileId);
                      setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
                    }
                  });
                }}
              >
                <Trash2 size={14} />
                Deletar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AppHeader = ({
  setIsProgressReportModalOpen,
  handleExportData,
  handleImportData,
  studyProfiles,
  activeProfileId,
  setActiveProfileId,
  onOpenProfileModal,
  onToggleCycle,
  isCycleVisible
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="header-container">
      <style>{`
        .header-container {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 16px;
          margin-bottom: 24px;
          position: relative;
          z-index: 50;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        /* Top Bar: Brand & Toggle */
        .header-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-box {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .brand-info h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .brand-info p {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 2px 0 0 0;
        }

        .mobile-menu-btn {
          display: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Content Area (Desktop: Row, Mobile: Hidden/Column) */
        .header-content {
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
        }

        .toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          gap: 20px;
        }

        /* Actions Group */
        .actions-group {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .action-btn.primary {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.2);
        }
        .action-btn.primary:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .action-btn.secondary {
          background: rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          border-color: rgba(148, 163, 184, 0.2);
        }
        .action-btn.secondary:hover {
          background: rgba(148, 163, 184, 0.2);
          color: white;
        }

        .brand-section .action-btn.secondary {
          padding: 8px 12px;
          height: 38px;
          border-radius: 10px;
        }

        .action-btn.admin {
          background: rgba(168, 85, 247, 0.1);
          color: #c084fc;
          border-color: rgba(168, 85, 247, 0.2);
        }
        .action-btn.admin:hover {
          background: rgba(168, 85, 247, 0.2);
        }

        /* Profile Group */
        .profile-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(15, 23, 42, 0.3);
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .profile-label {
          font-size: 0.85rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .profile-select {
          background: transparent;
          color: white;
          border: none;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          min-width: 150px;
        }
        .profile-select option {
          background: #1e293b;
        }

        .profile-controls {
          display: flex;
          gap: 4px;
          margin-left: 8px;
          padding-left: 8px;
          border-left: 1px solid rgba(148, 163, 184, 0.2);
        }

        .icon-btn {
          padding: 6px;
          border-radius: 6px;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Status Indicator */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #4ade80;
          background: rgba(34, 197, 94, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        /* --- MOBILE RESPONSIVE --- */
        @media (max-width: 768px) {
          .header-container {
            margin-bottom: 16px;
          }

          .header-top-bar {
            padding: 12px 16px;
          }

          .brand-info h1 { font-size: 1.2rem; }
          .brand-info p { display: none; } /* Hide subtitle on mobile */
          
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Menu Logic */
          .header-content {
            display: ${isMobileMenuOpen ? 'flex' : 'none'};
            animation: slideDown 0.2s ease-out;
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .toolbar-row {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 16px;
          }

          /* Reorder for Mobile: Profile First, then Actions */
          .profile-group {
            order: 1;
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            padding: 12px;
            gap: 12px;
          }

          .profile-label {
            margin-bottom: 4px;
          }

          .profile-select {
            background: rgba(0,0,0,0.2);
            padding: 8px;
            border-radius: 6px;
            width: 100%;
          }

          .profile-controls {
            margin: 0;
            padding: 0;
            border: none;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .icon-btn {
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px;
          }
          .icon-btn::after {
            content: attr(title); /* Use title as label on mobile */
            font-size: 0.8rem;
          }

          .actions-group {
            order: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .action-btn {
            justify-content: center;
            flex-direction: column;
            text-align: center;
            padding: 12px 8px;
            gap: 6px;
          }
          
          .action-btn span {
            font-size: 0.75rem;
          }

          /* Full width import button label */
          label.action-btn {
            width: 100%;
            box-sizing: border-box;
          }

          .status-badge {
            order: 3;
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>

      {/* 1. Navbar: Brand & Mobile Toggle */}
      <div className="header-top-bar">
        <div className="brand-section">
          <div className="brand-icon-box">
            <BookOpen size={24} color="white" />
          </div>
          <div className="brand-info">
            <h1>Organizador</h1>
            <p>Painel de Controle de Estudos</p>
          </div>
          <button
            className="action-btn secondary"
            style={{ padding: '10px 12px', borderRadius: '10px' }}
            onClick={() => {
              onToggleCycle?.();
              setIsMobileMenuOpen(false);
            }}
          >
            <ListChecks size={16} />
            <span>{isCycleVisible ? 'Ocultar Ciclo' : 'Ciclo de Estudos'}</span>
          </button>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. Content: Actions & Profile (Visible on Desktop, Toggled on Mobile) */}
      <div className="header-content">
        <div className="toolbar-row">
          {/* A. Actions (Left on Desktop) */}
          <div className="actions-group">
            <button
              onClick={() => {
                setIsProgressReportModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="action-btn primary"
            >
              <BarChart3 size={18} />
              <span>Relatório</span>
            </button>

            <button
              onClick={() => {
                handleExportData();
                setIsMobileMenuOpen(false);
              }}
              className="action-btn secondary"
            >
              <Download size={18} />
              <span>Exportar</span>
            </button>

            <label className="action-btn secondary">
              <Upload size={18} />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files[0]) handleImportData(e.target.files[0]);
                  setIsMobileMenuOpen(false);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={() => window.location.href = '/admin'}
              className="action-btn admin"
            >
              <Edit size={18} />
              <span>Admin</span>
            </button>
          </div>

          {/* B. Profile & Status (Right on Desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="status-badge">
              <CheckCircle2 size={12} />
              <span>Conectado</span>
            </div>

            <div className="profile-group">
              <div className="profile-label">
                <Users size={14} />
                <span className="mobile-only-label">Perfil:</span>
              </div>
              
              <select
                value={activeProfileId || ''}
                onChange={(e) => {
                  setActiveProfileId(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="profile-select"
              >
                {studyProfiles && studyProfiles.length > 0 ? (
                  studyProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                ) : (
                  <option value="">Sem perfil</option>
                )}
              </select>

              <div className="profile-controls">
                <button 
                  className="icon-btn" 
                  title="Editar Perfil"
                  onClick={() => {
                    onOpenProfileModal();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  title="Novo Perfil"
                  onClick={() => {
                    onOpenProfileModal();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
