🚀 TaskFlow

Sistema completo de gerenciamento de tarefas com arquitetura fullstack moderna.
=======================================================================================================================================================================================================================
🇧🇷 Português
=======================================================================================================================================================================================================================
🧩 Estrutura do Projeto
Este repositório é um monorepo contendo:

tasks-api/   # Backend (NestJS)
tasks-web/   # Frontend (Next.js)

⚙️ Tecnologias
Backend (tasks-api)
Node.js
NestJS
Prisma ORM
MySQL
Frontend (tasks-web)
Next.js
React
TypeScript
Tailwind CSS

📦 Pré-requisitos
Antes de começar, você precisa ter instalado:

Node.js (>= 18)
npm ou yarn
Banco de dados MySQL
Git

🔧 Instalação
Clone o repositório:
git clone https://github.com/SEU-USUARIO/TaskFlow.git
cd TaskFlow

▶️ Rodando o projeto
🔙 Backend
cd tasks-api
npm install
cp .env.example .env
npm run start:dev

🔜 Frontend
cd tasks-web
npm install
npm run dev

🌐 Acesso
Frontend: http://localhost:3000
Backend: http://localhost:3001 (ou porta configurada)

🔐 Variáveis de ambiente
Crie um arquivo .env em cada projeto baseado no .env.example.

Exemplo (tasks-api/.env):

DATABASE_URL=
JWT_SECRET=

🧪 Testes
Backend:
cd tasks-api
npm run test

📁 Estrutura detalhada
.
├── tasks-api/
│   ├── src/
│   ├── prisma/
│   └── ...
├── tasks-web/
│   ├── src/
│   └── ...
└── .gitignore

🚀 Roadmap
Autenticação de usuários

CRUD de tarefas

Integração API ↔ Frontend

Deploy (Vercel + Railway/Docker)

CI/CD com GitHub Actions

🤝 Contribuição
Pull requests são bem-vindos. Para mudanças maiores, abra uma issue antes.

📄 Licença
Este projeto não está licenciado para uso público.

Executar utilizando Docker e Docker Compose
Iniciar Docker atraves do Docker Desktop

docker-compose up --build

acessar em:
http://localhost:3000

=======================================================================================================================================================================================================================
🇺🇸 English
=======================================================================================================================================================================================================================
🧩 Project Structure
This repository is a monorepo containing:

tasks-api/   # Backend (NestJS)
tasks-web/   # Frontend (Next.js)

⚙️ Technologies
Backend (tasks-api)
Node.js
NestJS
Prisma ORM
PostgreSQL (or any configured DB)

Frontend (tasks-web)
Next.js
React
TypeScript

📦 Requirements
Node.js (>= 18)
npm or yarn
Database (e.g. PostgreSQL)
Git

🔧 Installation
git clone https://github.com/YOUR-USER/TaskFlow.git
cd TaskFlow

▶️ Running the project
Backend
cd tasks-api
npm install
cp .env.example .env
npm run start:dev

Frontend
cd tasks-web
npm install
npm run dev

🌐 Access
Frontend: http://localhost:3000
Backend: http://localhost:3001

🔐 Environment variables
Create a .env file based on .env.example.

🧪 Tests
cd tasks-api
npm run test

🚀 Roadmap
Authentication

Task CRUD

API ↔ Frontend integration

Deployment

CI/CD

📄 License
This project is not licensed for public use.
