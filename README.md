# Organizador de Estudos

Uma aplicação React moderna para organização e acompanhamento de estudos, com backend Firebase e interface responsiva.

## 🚀 Características

- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Backend Firebase**: Autenticação e banco de dados em tempo real
- **Modular**: Arquitetura componentizada e bem organizada
- **Segurança**: Validação de entrada e práticas de segurança implementadas
- **Performance**: Otimizações de carregamento e monitoramento
- **Deploy Ready**: Configurações para desenvolvimento e produção

## 📋 Pré-requisitos

- Node.js 18+ 
- npm 9+
- Conta Firebase (para produção)
- Docker (opcional, para containerização)

## 🛠️ Instalação e Configuração

### 1. Clone e Instale Dependências

```bash
# Clone o repositório
git clone <repository-url>
cd organizador-estudos

# Instale as dependências
npm install
```

### 2. Configuração do Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações do Firebase
```

**Configurações necessárias no .env:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Application Configuration
VITE_APP_ID=study-organizer-app
VITE_APP_NAME=Organizador de Estudos
VITE_APP_VERSION=1.0.0
```

### 3. Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Anonymous)
3. Ative Firestore Database
4. Configure as regras de segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Executando a Aplicação

### Desenvolvimento Local

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### Build para Produção

```bash
# Gera build otimizado
npm run build

# Preview do build
npm run preview
```

### Com Docker

```bash
# Desenvolvimento
docker-compose --profile dev up

# Produção
docker-compose up -d
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface
│   └── ErrorBoundary.jsx
├── config/             # Configurações
│   ├── environment.js  # Variáveis de ambiente
│   └── constants.js    # Constantes da aplicação
├── hooks/              # Custom hooks
│   ├── useAuth.js      # Hook de autenticação
│   ├── useFirestore.js # Hook do Firestore
│   └── useToast.js     # Hook de notificações
├── services/           # Serviços externos
│   └── firebase.js     # Configuração Firebase
├── utils/              # Utilitários
│   ├── errorHandler.js # Tratamento de erros
│   ├── helpers.js      # Funções auxiliares
│   ├── logger.js       # Sistema de logs
│   ├── performance.js  # Monitoramento
│   └── security.js     # Validações de segurança
├── App.jsx             # Componente principal
├── main.jsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🧪 Testes

### Configuração de Testes

```bash
# Instalar dependências de teste
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom

# Executar testes
npm run test

# Testes com interface
npm run test:ui

# Coverage
npm run test:coverage
```

### Estratégias de Teste Recomendadas

1. **Testes Unitários**
   - Componentes isolados
   - Funções utilitárias
   - Hooks customizados

2. **Testes de Integração**
   - Fluxos de autenticação
   - Operações do Firestore
   - Interações entre componentes

3. **Testes E2E** (Recomendado: Playwright ou Cypress)
   - Fluxos completos do usuário
   - Funcionalidades críticas

### Exemplo de Teste

```javascript
// src/components/ui/__tests__/Toast.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../Toast';

describe('Toast Component', () => {
  it('renders success toast correctly', () => {
    const mockOnClose = vi.fn();
    
    render(
      <Toast 
        message="Test message" 
        type="success" 
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas de lint
npm run format       # Formatar código
npm run test         # Executar testes
npm run test:ui      # Interface de testes
npm run test:coverage # Coverage dos testes
```

## 🚀 Deploy

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático configurado

### Docker

```bash
# Build da imagem
docker build -t organizador-estudos .

# Executar container
docker run -d -p 3000:80 --env-file .env organizador-estudos
```

### Servidor Próprio

```bash
# Build da aplicação
npm run build

# Servir arquivos estáticos (nginx, apache, etc.)
# Configurar proxy reverso se necessário
```

## 🔒 Segurança

### Práticas Implementadas

- Validação de entrada de dados
- Sanitização de HTML
- Headers de segurança (CSP, HSTS, etc.)
- Rate limiting
- Autenticação Firebase
- Regras de segurança Firestore

### Configurações de Produção

1. **Variáveis de Ambiente**: Nunca commitar credenciais
2. **HTTPS**: Sempre usar HTTPS em produção
3. **CSP**: Content Security Policy configurado
4. **Firestore Rules**: Regras restritivas configuradas

## 📊 Monitoramento

### Logs

- Sistema de logs estruturado
- Diferentes níveis (debug, info, warn, error)
- Contexto adicional para debugging

### Performance

- Monitoramento de operações lentas
- Métricas de memória
- Lazy loading de componentes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

1. Verifique a documentação
2. Procure em issues existentes
3. Crie uma nova issue com detalhes do problema

## ✅ Melhorias Implementadas Recentemente

### 1. **Persistência de Dados Corrigida**
- Dados dos perfis são salvos automaticamente no localStorage
- Perfil ativo é mantido entre sessões
- Carregamento automático dos dados salvos na inicialização

### 2. **Seleção de Perfis Existentes**
- Dropdown para selecionar entre perfis criados
- Interface intuitiva para alternar entre perfis
- Opções de editar e deletar perfis

### 3. **Calendário Responsivo Otimizado**
- Espaçamento otimizado para telas grandes
- Largura máxima limitada para melhor visualização
- Layout centralizado e proporções ajustadas

### 4. **Hierarquia Visual de Editais**
- Detecção automática de submatérias
- Recuo visual baseado na numeração (1., 1.1, 1.1.1)
- Cores e tamanhos diferenciados por nível

### 5. **Processador de Edital Inteligente**
- Cole texto do edital com Ctrl+C/V
- Extração automática de matérias e submatérias
- Mantém hierarquia baseada na numeração
- Preview antes de adicionar

### 6. **Interface Compacta**
- Padding e margens reduzidos
- Melhor aproveitamento do espaço
- Elementos mais compactos

### 🎯 Como Usar o Processador de Edital

1. Vá para a seção de matérias
2. Clique em "Mostrar Processador de Edital Colado"
3. Cole o texto do edital no campo
4. Clique em "Processar Edital Colado"
5. Revise os itens extraídos
6. Clique em "Adicionar Todos"

**Exemplo de formato de edital:**
```
DIREITO ADMINISTRATIVO:
1. Princípios, fontes e interpretação. 1.1 Lei nº 13.655/2018. 1.2 Princípios da administração pública.
2. Atividade e estrutura administrativa. 2.1 Terceiro setor. 2.2 Organizações sociais.
```

## 🔄 Changelog

### v1.1.0 (Atual)
- ✅ Persistência de dados corrigida
- ✅ Seleção de perfis existentes
- ✅ Calendário responsivo otimizado
- ✅ Hierarquia visual de editais
- ✅ Processador de edital inteligente
- ✅ Interface compacta
- ✅ Firebase configurado e funcional
- ✅ Código limpo (removidos testes e debug)

### v1.0.0
- Refatoração completa da aplicação
- Arquitetura modular implementada
- Sistema de build e deploy configurado
- Testes e documentação adicionados
