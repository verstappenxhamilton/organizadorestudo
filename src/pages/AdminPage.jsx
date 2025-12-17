import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Download, Upload } from 'lucide-react';
import { sanitizeText } from '../utils/helpers';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

const AdminPage = () => {
  const [editais, setEditais] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdital, setEditingEdital] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    concurso: '',
    orgao: '',
    banca: '',
    dataProva: '',
    inscricoesAte: '',
    materias: [],
    itensEdital: []
  });
  const [currentMateria, setCurrentMateria] = useState({ nome: '', peso: 1 });
  const [currentItem, setCurrentItem] = useState('');

  // Carregar editais salvos
  useEffect(() => {
    loadEditais();
  }, []);

  const loadEditais = () => {
    try {
      const saved = loadFromLocalStorage('admin_editais', []);
      setEditais(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error('Erro ao carregar editais:', error);
    }
  };

  const saveEditais = (newEditais) => {
    try {
      saveToLocalStorage('admin_editais', newEditais);
      setEditais(newEditais);
      
      // Esta parte seria substituída por uma API real em produção
    } catch (error) {
      console.error('Erro ao salvar editais:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.concurso) {
      alert('Nome e concurso são obrigatórios!');
      return;
    }

    const safeMaterias = (Array.isArray(formData.materias) ? formData.materias : []).map((m) => ({
      nome: sanitizeText(m?.nome || '').slice(0, 120),
      peso: Math.max(0, Math.min(100, Number(m?.peso) || 1))
    })).filter((m) => m.nome);

    const safeItens = (Array.isArray(formData.itensEdital) ? formData.itensEdital : [])
      .map((t) => sanitizeText(t || '').slice(0, 220))
      .filter(Boolean);

    const newEdital = {
      id: editingEdital ? editingEdital.id : Date.now(),
      ...formData,
      nome: sanitizeText(formData.nome).slice(0, 120),
      concurso: sanitizeText(formData.concurso).slice(0, 120),
      orgao: sanitizeText(formData.orgao).slice(0, 120),
      banca: sanitizeText(formData.banca).slice(0, 120),
      dataProva: sanitizeText(formData.dataProva).slice(0, 20),
      inscricoesAte: sanitizeText(formData.inscricoesAte).slice(0, 20),
      materias: safeMaterias,
      itensEdital: safeItens,
      dataAtualização: new Date().toISOString()
    };

    let updatedEditais;
    if (editingEdital) {
      updatedEditais = editais.map(e => e.id === editingEdital.id ? newEdital : e);
    } else {
      updatedEditais = [...editais, newEdital];
    }

    saveEditais(updatedEditais);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      concurso: '',
      orgao: '',
      banca: '',
      dataProva: '',
      inscricoesAte: '',
      materias: [],
      itensEdital: []
    });
    setCurrentMateria({ nome: '', peso: 1 });
    setCurrentItem('');
    setEditingEdital(null);
  };

  const handleEdit = (edital) => {
    setEditingEdital(edital);
    setFormData(edital);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este edital?')) {
      const updatedEditais = editais.filter(e => e.id !== id);
      saveEditais(updatedEditais);
    }
  };

  const addMateria = () => {
    if (!currentMateria.nome) return;
    
    setFormData(prev => ({
      ...prev,
      materias: [...prev.materias, { ...currentMateria, id: Date.now() }]
    }));
    setCurrentMateria({ nome: '', peso: 1 });
  };

  const removeMateria = (id) => {
    setFormData(prev => ({
      ...prev,
      materias: prev.materias.filter(m => m.id !== id)
    }));
  };

  const addItem = () => {
    if (!currentItem.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      itensEdital: [...prev.itensEdital, { id: Date.now(), nome: currentItem.trim() }]
    }));
    setCurrentItem('');
  };

  const removeItem = (id) => {
    setFormData(prev => ({
      ...prev,
      itensEdital: prev.itensEdital.filter(i => i.id !== id)
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(editais, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `editais_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          saveEditais(importedData);
          alert('Dados importados com sucesso!');
        } else {
          alert('Formato de arquivo inválido!');
        }
      } catch (error) {
        alert('Erro ao importar dados: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const filteredEditais = editais.filter(edital =>
    edital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.concurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.orgao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>📋 Administração de Editais</h1>
          <div className="admin-header-actions">
            <div className="search-container">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar editais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              Novo Edital
            </button>
            <button className="btn btn-secondary" onClick={exportData}>
              <Download size={20} />
              Exportar
            </button>
            <label className="btn btn-secondary import-btn">
              <Upload size={20} />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {filteredEditais.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum edital cadastrado</h2>
            <p>Comece adicionando seu primeiro edital para que os usuários possam selecioná-lo.</p>
            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              Adicionar Primeiro Edital
            </button>
          </div>
        ) : (
          <div className="editais-grid">
            {filteredEditais.map(edital => (
              <div key={edital.id} className="edital-card">
                <div className="edital-header">
                  <h3>{edital.nome}</h3>
                  <div className="edital-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(edital)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(edital.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="edital-info">
                  <div className="info-item">
                    <strong>Concurso:</strong> {edital.concurso}
                  </div>
                  {edital.orgao && (
                    <div className="info-item">
                      <strong>Órgão:</strong> {edital.orgao}
                    </div>
                  )}
                  {edital.banca && (
                    <div className="info-item">
                      <strong>Banca:</strong> {edital.banca}
                    </div>
                  )}
                  {edital.dataProva && (
                    <div className="info-item">
                      <strong>Prova:</strong> {new Date(edital.dataProva).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="info-item">
                    <strong>Matérias:</strong> {edital.materias?.length || 0}
                  </div>
                  <div className="info-item">
                    <strong>Itens do Edital:</strong> {edital.itensEdital?.length || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEdital ? 'Editar Edital' : 'Novo Edital'}</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="edital-form">
                <div className="form-section">
                  <h3>Informações Básicas</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome do Edital *</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                        placeholder="Ex: Edital nº 001/2024"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Concurso *</label>
                      <input
                        type="text"
                        value={formData.concurso}
                        onChange={(e) => setFormData(prev => ({ ...prev, concurso: e.target.value }))}
                        required
                        placeholder="Ex: Analista Judiciário - TRT 15ª Região"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Órgão</label>
                      <input
                        type="text"
                        value={formData.orgao}
                        onChange={(e) => setFormData(prev => ({ ...prev, orgao: e.target.value }))}
                        placeholder="Ex: Tribunal Regional do Trabalho"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Banca</label>
                      <input
                        type="text"
                        value={formData.banca}
                        onChange={(e) => setFormData(prev => ({ ...prev, banca: e.target.value }))}
                        placeholder="Ex: FCC, CESPE, VUNESP"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Data da Prova</label>
                      <input
                        type="date"
                        value={formData.dataProva}
                        onChange={(e) => setFormData(prev => ({ ...prev, dataProva: e.target.value }))}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Inscrições até</label>
                      <input
                        type="date"
                        value={formData.inscricoesAte}
                        onChange={(e) => setFormData(prev => ({ ...prev, inscricoesAte: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Matérias</h3>
                  <div className="add-item-section">
                    <div className="add-item-inputs">
                      <input
                        type="text"
                        placeholder="Nome da matéria"
                        value={currentMateria.nome}
                        onChange={(e) => setCurrentMateria(prev => ({ ...prev, nome: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMateria())}
                      />
                      <input
                        type="number"
                        placeholder="Peso"
                        min="1"
                        max="10"
                        value={currentMateria.peso}
                        onChange={(e) => setCurrentMateria(prev => ({ ...prev, peso: parseInt(e.target.value) || 1 }))}
                      />
                      <button type="button" onClick={addMateria} className="btn btn-primary">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="items-list">
                    {formData.materias.map(materia => (
                      <div key={materia.id} className="item-tag">
                        <span>{materia.nome} (Peso: {materia.peso})</span>
                        <button type="button" onClick={() => removeMateria(materia.id)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Itens do Edital</h3>
                  <div className="add-item-section">
                    <div className="add-item-inputs">
                      <input
                        type="text"
                        placeholder="Item do edital"
                        value={currentItem}
                        onChange={(e) => setCurrentItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                      />
                      <button type="button" onClick={addItem} className="btn btn-primary">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="items-list">
                    {formData.itensEdital.map(item => (
                      <div key={item.id} className="item-tag">
                        <span>{item.nome}</span>
                        <button type="button" onClick={() => removeItem(item.id)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} />
                    {editingEdital ? 'Atualizar' : 'Salvar'} Edital
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
