# Volo Manager

Sistema de gerenciamento de projetos audiovisuais da **Volo Visual**. Controla clientes, projetos, status de produção e orçamentos. Inclui portal do cliente para acompanhamento de projetos em tempo real.

---

## Tecnologias

**Backend**

- Python 3.12+
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT (autenticação)

**Frontend**

- React + Vite
- Tailwind CSS
- React Router

**Infraestrutura**

- Docker (banco de dados)

---

## Pré-requisitos

Antes de começar, instale:

- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

Para verificar se estão instalados, abra o terminal e rode:

```bash
python --version
node --version
docker --version
git --version
```

---

## Clonando o projeto

```bash
git clone https://github.com/EderJZ/volo-manager.git
cd volo-manager
```

---

## Configurando o Banco de Dados

O banco de dados roda via Docker. Com o Docker Desktop aberto, rode:

```bash
docker-compose up -d
```

Isso vai baixar e iniciar o PostgreSQL automaticamente. Para verificar se está rodando:

```bash
docker ps
```

Deve aparecer um container chamado `volo_manager_db`.

---

## Configurando o Backend

### 1. Entrar na pasta do backend

```bash
cd backend
```

### 2. Criar o ambiente virtual

O ambiente virtual isola as dependências do projeto para não conflitar com outros projetos Python na sua máquina.

**Windows:**

```bash
python -m venv .venv
```

**Mac/Linux:**

```bash
python3 -m venv .venv
```

### 3. Ativar o ambiente virtual

Sempre que for trabalhar no projeto, ative o ambiente virtual primeiro.

**Windows (PowerShell):**

```bash
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**

```bash
.venv\Scripts\activate.bat
```

**Mac/Linux:**

```bash
source .venv/bin/activate
```

Quando ativado, o terminal mostra `(.venv)` no início da linha.

> **Problema no Windows com PowerShell?** Se aparecer erro de permissão ao ativar, rode este comando e tente novamente:
>
> ```bash
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 4. Instalar as dependências

Com o ambiente virtual ativado:

```bash
pip install -r requirements.txt
```

> **Problema com pip?** Tente atualizar o pip primeiro:
>
> ```bash
> python -m pip install --upgrade pip
> ```
>
> Depois rode o `pip install -r requirements.txt` novamente.

### 5. Criar o arquivo de variáveis de ambiente

Crie um arquivo chamado `.env` dentro da pasta `backend/` com o seguinte conteúdo:

```
SECRET_KEY=sua-chave-secreta-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Para gerar uma chave secreta segura, rode:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copie o resultado e cole no lugar de `sua-chave-secreta-aqui`.

### 6. Iniciar o backend

```bash
uvicorn app.main:app --reload
```

O backend estará disponível em `http://127.0.0.1:8000`.

A documentação automática (Swagger) estará em `http://127.0.0.1:8000/docs`.

---

## Configurando o Frontend

Abra um **novo terminal** (mantenha o backend rodando no anterior).

### 1. Entrar na pasta do frontend

```bash
cd frontend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Iniciar o frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## Criando o primeiro usuário administrador

Com o backend rodando, acesse o Swagger em `http://127.0.0.1:8000/docs`.

1. Clique em `POST /auth/register`
2. Clique em **Try it out**
3. Preencha o body:

```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "sua-senha",
  "role": "admin"
}
```

4. Clique em **Execute**

Agora acesse `http://localhost:5173/login` e entre com o email e senha cadastrados.

---

## Estrutura do projeto

```
volo-manager/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos do banco de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── schemas/         # Validação de dados (Pydantic)
│   │   ├── services/        # Lógica de autenticação
│   │   ├── database.py      # Conexão com o banco
│   │   ├── main.py          # Aplicação principal
│   │   └── settings.py      # Configurações (.env)
│   ├── .env                 # Variáveis de ambiente (não vai ao Git)
│   └── requirements.txt     # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   └── services/        # Configuração da API
│   └── package.json
└── docker-compose.yml       # Configuração do banco de dados
```

---

## Perfis de usuário

| Perfil     | Acesso                                                |
| ---------- | ----------------------------------------------------- |
| `admin`    | Acesso total — gerencia usuários, clientes e projetos |
| `editor`   | Gerencia clientes e projetos                          |
| `operator` | Gerencia clientes e projetos                          |
| `client`   | Acesso apenas ao portal do cliente                    |

---

## Rotas da aplicação

| Rota             | Descrição                           |
| ---------------- | ----------------------------------- |
| `/login`         | Tela de login                       |
| `/dashboard`     | Visão geral (admin/editor/operator) |
| `/clients`       | Gerenciamento de clientes           |
| `/projects`      | Gerenciamento de projetos           |
| `/users`         | Gerenciamento de usuários (admin)   |
| `/client-portal` | Portal do cliente                   |

---

## Problemas comuns

### `pip install` falha com erro de compilação

Atualize o pip e tente novamente:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Erro de conexão com o banco de dados

Verifique se o Docker está rodando e o container está ativo:

```bash
docker ps
```

Se não aparecer o `volo_manager_db`, rode:

```bash
docker-compose up -d
```

### Porta 8000 já em uso

Outro processo está usando a porta. Rode o backend em outra porta:

```bash
uvicorn app.main:app --reload --port 8001
```

### Porta 5173 já em uso

O Vite escolhe automaticamente a próxima porta disponível. Verifique no terminal qual porta foi usada.

### Ambiente virtual não ativa no Windows

Execute no PowerShell como administrador:

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Comandos úteis

```bash
# Ver logs do banco de dados
docker logs volo_manager_db

# Parar o banco de dados
docker-compose down

# Reiniciar o banco de dados
docker-compose restart

# Acessar o banco via terminal
docker exec -it volo_manager_db psql -U volo -d volo_manager
```
