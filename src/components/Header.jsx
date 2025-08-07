import React from 'react';
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
  Plus
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
  onOpenProfileModal
}) => {
  return (
    <div className="app-header-unified">
      <div className="header-main-section">
        {/* Logo e Título */}
        <div className="header-brand">
          <div className="brand-icon">
            <BookOpen size={24} color="white" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">📚 Organizador de Estudos</h1>
            <p className="brand-subtitle">Seu painel para conquistar os concursos!</p>
          </div>
        </div>

        {/* Controles de Ação */}
        <div className="header-actions">
          <button
            onClick={() => setIsProgressReportModalOpen(true)}
            className="action-btn primary"
            title="Relatório (Ctrl+R)"
          >
            <BarChart3 size={16} />
            <span>Relatório</span>
          </button>

          <button
            onClick={handleExportData}
            className="action-btn secondary"
            title="Exportar (Ctrl+E)"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>

          <label className="action-btn secondary" style={{ cursor: 'pointer' }} title="Importar dados">
            <Upload size={16} />
            <span>Importar</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImportData(file);
                }
              }}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={() => window.location.href = '/admin'}
            className="action-btn admin"
            title="Administração de Editais"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            <Edit size={16} />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Seção de Perfil */}
      <div className="header-profile-section">
        <div className="profile-controls">
          <div className="profile-selector">
            <Users size={16} className="profile-icon" />
            <span className="profile-label">Concurso:</span>
            {studyProfiles && studyProfiles.length > 0 ? (
              <select
                value={activeProfileId || ''}
                onChange={(e) => setActiveProfileId(e.target.value)}
                className="profile-select"
              >
                {studyProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <span className="no-profile">Nenhum concurso criado</span>
            )}
          </div>

          <div className="profile-actions">
            <button
              onClick={onOpenProfileModal}
              className="profile-btn edit"
              title="Gerenciar Concursos"
            >
              <Edit size={14} />
              <span>Editar</span>
            </button>

            <button
              onClick={onOpenProfileModal}
              className="profile-btn create"
              title="Novo Concurso (Ctrl+N)"
            >
              <Plus size={14} />
              <span>Novo</span>
            </button>
          </div>
        </div>

        <div className="connection-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Firebase Conectado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
