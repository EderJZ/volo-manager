# 🎬 Volo Manager — Sistema de Gestão de Projetos Audiovisuais

> Sistema interno de gerenciamento de projetos para a **Volo Visual**, empresa de cinematografia aérea com drones. Desenvolvido do zero com FastAPI + React, com portal do cliente, board Kanban e deploy em produção.

![Deploy Backend](https://img.shields.io/badge/backend-Render-46E3B7?style=flat-square&logo=render)
![Deploy Frontend](https://img.shields.io/badge/frontend-Vercel-black?style=flat-square&logo=vercel)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Status](https://img.shields.io/badge/status-em%20produção-brightgreen?style=flat-square)

---

## 🌐 Acesse o Projeto

🔗 **[manager.volovisual.com.br](https://manager.volovisual.com.br)**  
📡 **[API — Swagger Docs](https://volo-manager-backend.onrender.com/docs)**

---

## 📸 Sobre o Projeto

O **Volo Manager** é um sistema web completo de gestão operacional desenvolvido para a Volo Visual. Permite que a equipe gerencie todo o ciclo de vida dos projetos audiovisuais — do orçamento à entrega — com controle de fases, anotações internas, comunicação com clientes e análise financeira.

O sistema foi construído do zero como projeto de portfólio com foco em arquitetura profissional: API REST com autenticação JWT, banco de dados relacional, múltiplos perfis de usuário, containerização com Docker e deploy em produção.

---

## ✨ Funcionalidades

### 👥 Gestão de Usuários e Clientes

- Cadastro de usuários com perfis: **Admin**, **Editor**, **Operador** e **Cliente**
- Controle de acesso por perfil em todas as rotas
- Clientes com acesso exclusivo ao portal próprio
- Ativação e desativação de clientes (soft delete)

### 📋 Board Kanban de Projetos

- Pipeline visual com 7 fases: Orçamento → Aprovado → Pré-produção → Gravando → Em edição → Revisão → Concluído
- Cards com título, cliente, prazo, valor e contador de anotações
- Alertas automáticos de prazo vencido
- Status especiais: **Arquivado** (resgatável) e **Cancelado** (somente leitura)

### 📝 Sistema de Anotações

- Anotações **internas** (visíveis apenas para a equipe)
- Anotações **para o cliente** (aparecem no portal)
- Histórico com autor, data e hora
- Edição e remoção de anotações

### 🔄 Controle de Fases

- Botão "Concluir etapa e avançar" com modal de resumo obrigatório
- Resumo da etapa vira anotação destacada no histórico
- Voltar fase, arquivar e cancelar projeto
- Linha do tempo visual por projeto

### 🌟 Portal do Cliente

- Login separado com acesso exclusivo aos próprios projetos
- Barra de progresso visual com todas as fases
- Atualizações em tempo real de cada etapa concluída
- Sino de notificações para novas atualizações
- Troca de senha pelo próprio cliente

### 📊 Dashboard com Análises

- Cards de resumo: clientes, projetos, orçamento total e ticket médio
- Pipeline interativo — clique em cada status para ver os projetos
- Aba **Financeiro** com gráficos de linha (orçamento por mês e receita concluída)
- Taxa de conclusão do total orçado

### 🔐 Segurança

- Autenticação JWT com expiração de token
- Rotas protegidas por perfil de usuário
- Senha hasheada com bcrypt
- Variáveis de ambiente para dados sensíveis
- Registro de novos usuários restrito ao admin

---

## 🛠️ Tecnologias Utilizadas

### Backend

| Tecnologia        | Uso                                    |
| ----------------- | -------------------------------------- |
| FastAPI           | Framework principal da API REST        |
| SQLAlchemy        | ORM para acesso ao banco de dados      |
| PostgreSQL 16     | Banco de dados relacional              |
| Pydantic          | Validação de dados e schemas           |
| python-jose       | Geração e validação de tokens JWT      |
| bcrypt / passlib  | Hash seguro de senhas                  |
| Uvicorn           | Servidor ASGI de produção              |
| pydantic-settings | Configuração via variáveis de ambiente |

### Frontend

| Tecnologia       | Uso                                           |
| ---------------- | --------------------------------------------- |
| React 18         | Biblioteca principal de UI                    |
| Vite 8           | Bundler e servidor de desenvolvimento         |
| React Router DOM | Roteamento e rotas protegidas                 |
| Axios            | Cliente HTTP para comunicação com a API       |
| Tailwind CSS     | Estilização utilitária                        |
| SVG puro         | Gráficos financeiros sem bibliotecas externas |

### Infraestrutura

| Tecnologia              | Uso                                  |
| ----------------------- | ------------------------------------ |
| Docker + Docker Compose | Containerização de todos os serviços |
| Nginx                   | Servidor do frontend + proxy reverso |
| Render                  | Hospedagem do backend em produção    |
| Vercel                  | Hospedagem do frontend em produção   |
| GitHub                  | Versionamento e CI/CD automático     |

---

## 📁 Estrutura do Projeto

```
volo-manager/
├── backend/
│   ├── app/
│   │   ├── models/              # Models SQLAlchemy
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── project_note.py
│   │   │   └── project_phase_date.py
│   │   ├── routes/              # Endpoints da API
│   │   │   ├── auth.py
│   │   │   ├── clients.py
│   │   │   ├── projects.py
│   │   │   ├── project_notes.py
│   │   │   ├── project_phases.py
│   │   │   ├── dashboard.py
│   │   │   ├── users.py
│   │   │   └── client_portal.py
│   │   ├── schemas/             # Schemas Pydantic
│   │   ├── services/            # Autenticação JWT
│   │   ├── constants.py         # Fases e status do pipeline
│   │   ├── database.py          # Conexão com PostgreSQL
│   │   ├── settings.py          # Configuração via .env
│   │   └── main.py              # Aplicação FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.jsx    # Layout admin com sidebar
│   │   │   ├── ClientLayout.jsx # Layout portal do cliente
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Projects.jsx     # Board Kanban
│   │   │   ├── Users.jsx
│   │   │   └── ClientPortal.jsx
│   │   └── services/
│   │       └── api.js           # Configuração Axios
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Modelagem do Banco de Dados

```
users
├── id, name, email, password_hash
├── role (admin | editor | operator | client)
├── is_active, phone, company

projects
├── id, title, description, status
├── budget, start_date, deadline
├── current_phase_description
├── has_client_update
└── client_id → users.id

project_notes
├── id, project_id, user_id
├── content, type (internal | client)
└── created_at, updated_at

project_phase_dates
├── id, project_id, phase
├── start_date, end_date
```

---

## 🔌 Endpoints da API

### Auth

| Método | Rota             | Descrição               |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Criar usuário (admin)   |
| POST   | `/auth/login`    | Login e geração de JWT  |
| GET    | `/auth/me`       | Dados do usuário logado |

### Clientes / Usuários

| Método | Rota            | Descrição                  |
| ------ | --------------- | -------------------------- |
| GET    | `/clients/`     | Listar clientes ativos     |
| POST   | `/clients/`     | Criar cliente com senha    |
| PUT    | `/clients/{id}` | Editar / desativar cliente |
| GET    | `/users/`       | Listar equipe interna      |
| POST   | `/users/`       | Criar usuário da equipe    |

### Projetos

| Método | Rota                             | Descrição           |
| ------ | -------------------------------- | ------------------- |
| GET    | `/projects/`                     | Listar projetos     |
| POST   | `/projects/`                     | Criar projeto       |
| PUT    | `/projects/{id}`                 | Editar projeto      |
| DELETE | `/projects/{id}`                 | Excluir (admin)     |
| POST   | `/projects/{id}/phases/advance`  | Avançar fase        |
| POST   | `/projects/{id}/phases/retreat`  | Voltar fase         |
| POST   | `/projects/{id}/phases/cancel`   | Cancelar projeto    |
| POST   | `/projects/{id}/phases/archive`  | Arquivar projeto    |
| POST   | `/projects/{id}/phases/restore`  | Restaurar arquivado |
| GET    | `/projects/{id}/notes/`          | Listar anotações    |
| POST   | `/projects/{id}/notes/`          | Criar anotação      |
| PUT    | `/projects/{id}/notes/{note_id}` | Editar anotação     |
| DELETE | `/projects/{id}/notes/{note_id}` | Remover anotação    |

### Dashboard

| Método | Rota                 | Descrição                    |
| ------ | -------------------- | ---------------------------- |
| GET    | `/dashboard/summary` | Resumo completo com gráficos |

### Portal do Cliente

| Método | Rota                                    | Descrição               |
| ------ | --------------------------------------- | ----------------------- |
| GET    | `/client-portal/me`                     | Dados do cliente logado |
| GET    | `/client-portal/my-projects`            | Projetos do cliente     |
| GET    | `/client-portal/my-projects/{id}/notes` | Atualizações do projeto |
| POST   | `/client-portal/mark-read/{id}`         | Marcar como lido        |
| PUT    | `/client-portal/change-password`        | Trocar senha            |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/EderJZ/volo-manager.git
cd volo-manager

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite o .env com sua SECRET_KEY

# Suba todos os serviços
docker-compose up --build
```

Acesse:

- **Frontend:** `http://localhost`
- **Backend:** `http://localhost:8000`
- **Swagger:** `http://localhost:8000/docs`

### Sem Docker (desenvolvimento)

```bash
# 1. Banco de dados
docker-compose up db -d

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### Criar o primeiro usuário admin

Com o backend rodando, acesse `http://localhost:8000/docs` e use `POST /auth/register`:

```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "sua-senha",
  "role": "admin"
}
```

---

## 🌍 Deploy em Produção

| Serviço        | Plataforma        | URL                               |
| -------------- | ----------------- | --------------------------------- |
| Frontend       | Vercel            | manager.volovisual.com.br         |
| Backend        | Render            | volo-manager-backend.onrender.com |
| Banco de dados | Render PostgreSQL | Privado                           |

### Variáveis de ambiente (produção)

**Backend (Render):**

```
DATABASE_URL=postgresql://...
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**Frontend (Vercel):**

```
VITE_API_URL=https://volo-manager-backend.onrender.com
```

---

## 🔐 Perfis de Acesso

| Perfil       | Permissões                                                          |
| ------------ | ------------------------------------------------------------------- |
| **Admin**    | Acesso total — gerencia usuários, exclui projetos, move fases       |
| **Editor**   | Gerencia clientes, projetos e move fases                            |
| **Operador** | Gerencia clientes e projetos, não move fases                        |
| **Cliente**  | Acesso exclusivo ao portal — visualiza seus projetos e atualizações |

---

## 📦 Scripts Disponíveis

```bash
# Backend
uvicorn app.main:app --reload       # Desenvolvimento
uvicorn app.main:app --host 0.0.0.0 # Produção

# Frontend
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview local do build

# Docker
docker-compose up --build    # Subir todos os serviços
docker-compose down          # Parar todos os serviços
docker-compose up db -d      # Apenas o banco de dados
```

---

## 🧠 Aprendizados e Desafios

Este projeto foi desenvolvido como parte do meu aprendizado em desenvolvimento web full stack. Alguns dos principais desafios enfrentados:

- **Arquitetura de autenticação JWT** com refresh automático e verificação de expiração no frontend
- **Relacionamentos SQLAlchemy** entre usuários, clientes e projetos após refatoração de tabelas
- **Containerização com Docker** e comunicação entre serviços via Nginx proxy reverso
- **Deploy em produção** com variáveis de ambiente, CORS e configuração de domínio personalizado
- **Design de sistema de permissões** com múltiplos perfis de acesso em rotas protegidas
- **Portal do cliente** com notificações em tempo real e separação total de contexto

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Eder JZ**

[![GitHub](https://img.shields.io/badge/GitHub-EderJZ-181717?style=flat-square&logo=github)](https://github.com/EderJZ)

---

## 📄 Licença

Este projeto é de uso privado. Todos os direitos reservados à Volo Visual.
