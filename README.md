# AninhaCatTV - Backend

Backend da plataforma AninhaCatTV, uma aplicação que integra autenticação com Twitch, gerenciamento de sessões de chat em tempo real e ranking de usuários.

## 📋 Tabela de Conteúdo

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração Local](#configuração-local)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Banco de Dados](#banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)

## 🏗️ Arquitetura

### Visão Geral

A aplicação segue uma arquitetura em **camadas** com separação clara de responsabilidades:

```
Cliente (Frontend)
      ↓
    Routes
      ↓
  Controllers
      ↓
   Services
      ↓
     DTOs
      ↓
   Database (Prisma)
      ↓
    MySQL
```

### Componentes Principais

- **Express Server**: Framework web que gerencia requisições HTTP
- **Prisma ORM**: Gerenciamento de banco de dados MySQL
- **Autenticação Twitch OAuth2**: Integração com Twitch para login
- **JWT**: Autenticação e autorização de usuários
- **Rate Limiting**: Proteção contra abuso de requisições
- **Chat Polling Job**: Job que sincroniza chat em tempo real a cada 5 minutos

### Fluxo de Autenticação

```
1. Usuário clica em "Login com Twitch"
   ↓
2. Redirecionado para redirectToTwitchController
   ↓
3. Redireciona para OAuth Twitch
   ↓
4. Twitch redireciona para callback com código
   ↓
5. loginTwitchController processa o código
   ↓
6. Valida token com Twitch e cria/atualiza usuário
   ↓
7. Retorna JWT para cliente
   ↓
8. Cliente armazena token e faz requisições autenticadas
```

## 🛠️ Tecnologias

- **Node.js + TypeScript**: Runtime e linguagem tipada
- **Express 5**: Framework web moderno
- **Prisma 6**: ORM type-safe para banco de dados
- **MySQL**: Banco de dados relacional
- **JWT**: Autenticação segura
- **bcryptjs**: Hash de senhas
- **Axios**: Cliente HTTP para chamadas à API Twitch
- **Zod**: Validação de schemas
- **tsx**: Executor de TypeScript para desenvolvimento

## 📁 Estrutura de Pastas

```
src/
├── @types/                 # Definições TypeScript customizadas
│   └── express/           # Extensões do tipo Express
├── clients/               # Clientes HTTP para APIs externas
│   └── twitch.client.ts   # Cliente Axios para Twitch API
├── controllers/           # Controladores (camada de requisição/resposta)
│   ├── api.ts            # Endpoints de teste
│   ├── botCallback.controller.ts
│   ├── loginTwitch.controller.ts
│   ├── rankingTwitch.controller.ts
│   ├── redirectBotToTwitch.controller.ts
│   └── redirectToTwitch.controller.ts
├── dtos/                 # Data Transfer Objects (validação de dados)
│   ├── ranking.dto.ts
│   ├── twitchToken.dto.ts
│   └── twitchUser.dto.ts
├── errors/              # Classes de erro customizadas
│   ├── AppError.ts
│   └── ValitadionError.ts
├── jobs/                # Jobs/Tasks agendadas
│   └── pollChatters.ts  # Polling de chat a cada 5 minutos
├── lib/                 # Utilitários de biblioteca
│   └── prisma.ts        # Instância do Prisma Client
├── routes/              # Definição de rotas
│   ├── index.ts         # Router principal
│   ├── auth.routes.ts   # Rotas de autenticação
│   ├── api.routes.ts    # Rotas de API
│   └── bot.routes.ts    # Rotas do bot
├── services/            # Lógica de negócio
│   ├── botToken.service.ts
│   ├── loginTwitch.service.ts
│   ├── rankingTwitch.service.ts
│   └── twitchStatus.service.ts
├── utils/              # Funções utilitárias
│   ├── system/
│   │   ├── buildAuditChanges.ts
│   │   ├── password.ts
│   │   └── validateSchema.ts
│   └── twitch/
│       └── password.ts
├── env.d.ts            # Tipagem de variáveis de ambiente
└── server.ts           # Arquivo principal (entry point)

prisma/
└── schema.prisma       # Definição do banco de dados
```

## 🚀 Configuração Local

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- MySQL 8.0+ em execução
- Conta Twitch Developer com credenciais OAuth2

### Passo 1: Clonar Repositório

```bash
git clone <url-do-repositorio>
cd aninhacattv
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/aninhacattv"

# Servidor
PORT=3000
NODE_ENV=development

# Twitch OAuth
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# Bot
BOT_OAUTH_TOKEN=seu_token_do_bot_aqui
BOT_USERNAME=seu_username_do_bot_aqui
```

### Passo 4: Configurar Banco de Dados

```bash
# Criar banco de dados e tabelas
npm run db:migrate

# (Opcional) Visualizar banco com interface gráfica
npm run db:studio
```

### Passo 5: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento com hot reload (tsx watch) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia servidor compilado (produção) |
| `npm run db:migrate` | Executa migrações pendentes do Prisma |
| `npm run db:deploy` | Aplica migrações em produção |
| `npm run db:reset` | Reseta banco de dados (apaga dados!) |
| `npm run db:studio` | Abre interface gráfica do Prisma Studio |
| `npm run prisma` | Executa comandos do Prisma diretamente |

## 🗄️ Banco de Dados

### Schema do Banco

O banco possui 4 modelos principais:

#### User
Armazena informações do usuário autenticado via Twitch.
```
- id (String): ID único
- twitchId (String): ID da conta Twitch
- username (String): Nome de usuário
- email (String, opcional)
- avatar (String, opcional): URL do avatar
- createdAt (DateTime): Data de criação
```

#### LoginHistory
Rastreia logins do usuário.
```
- id (String): ID único
- userId (String): Referência ao usuário
- loggedAt (DateTime): Data do login
- ip (String, opcional): IP do cliente
- userAgent (String, opcional): User Agent do navegador
```

#### TwitchToken
Armazena tokens OAuth da Twitch.
```
- id (String): ID único
- userId (String): Referência ao usuário
- accessToken (String): Token de acesso
- refreshToken (String): Token para renovação
- expiresAt (DateTime): Data de expiração
- createdAt (DateTime): Data de criação
```

#### ChatSession
Rastreia sessões de chat ativas.
```
- id (String): ID único
- userId (String): Referência ao usuário
- channel (String): Nome do canal Twitch
- startedAt (DateTime): Data de início
- endedAt (DateTime, opcional): Data de término (null = ativa)
```

### Executar Migrações

```bash
# Desenvolver com reset automático
npm run db:migrate

# Produção (apenas aplicar)
npm run db:deploy

# Resetar tudo (CUIDADO!)
npm run db:reset
```

## 🔐 Variáveis de Ambiente

### Obrigatórias

- `DATABASE_URL`: URL de conexão MySQL
- `TWITCH_CLIENT_ID`: ID da aplicação Twitch
- `TWITCH_CLIENT_SECRET`: Secret da aplicação Twitch
- `JWT_SECRET`: Chave secreta para assinar JWTs

### Opcionais

- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (development/production)
- `TWITCH_REDIRECT_URI`: URL de callback após autenticação
- `JWT_EXPIRES_IN`: Expiração do JWT (padrão: 7d)
- `BOT_OAUTH_TOKEN`: Token do bot Twitch
- `BOT_USERNAME`: Username do bot Twitch

### Obter Credenciais Twitch

1. Acesse [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Crie uma nova aplicação
3. Configure a URL de redirecionamento OAuth como: `http://localhost:3000/auth/twitch/callback`
4. Copie Client ID e Client Secret para o `.env`

## 📡 Endpoints da API

### Autenticação

#### `GET /auth/twitch`
Inicia o fluxo de autenticação Twitch.
- **Redirecionador**: Redireciona para Twitch OAuth

#### `GET /auth/twitch/callback`
Callback da Twitch após autenticação.
- **Query Params**: `code`, `state`
- **Resposta**: JWT e dados do usuário

#### `GET /auth/live`
Obtém ranking de usuários ativos.
- **Resposta**: Lista de usuários com sessões ativas

### API Geral

#### `GET /api/`
Endpoint de teste.
- **Resposta**: Mensagem simples

### Bot

Veja arquivo `src/routes/bot.routes.ts` para rotas do bot.

## 🔄 Jobs/Tasks

### Chat Polling (pollChatters.ts)
Executa a cada **5 minutos** em background para:
- Sincronizar participants do chat
- Atualizar sessões ativas
- Rastrear histórico de chat

Iniciado automaticamente no servidor.

## 🐛 Debugging

### Ver logs do Prisma
```bash
export DEBUG="prisma:*"
npm run dev
```

### Acessar banco com Studio
```bash
npm run db:studio
```

Abre interface em `http://localhost:5555`

## 📦 Build para Produção

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor compilado
npm start
```

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit suas mudanças: `git commit -m 'Add sua-feature'`
3. Push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request

## 📄 Licença

ISC
