# AninhaCatTV • Projeto Completo

Projeto full-stack para gerenciar e exibir ranking de viewers da channel AninhaCatTV.

## 📦 Estrutura

```
aninhacattv/
├── api/   # Backend - Express + TypeScript + Prisma
└── web/   # Frontend - Next.js + React + Tailwind CSS
```

## 🚀 Subprojetos

### 📋 Backend: API
**Localização:** `./api`  
Servidor responsável por autenticação, ranking com filtros temporais e integração Twitch.

👉 [Documentação completa](./api/README.md)

### 🌐 Frontend: Web
**Localização:** `./web`  
Landing page que exibe ranking em tempo real com filtros por período.

👉 [Documentação completa](./web/README.md)

## ⚡ Quick Start

```bash
# Backend
cd api && npm install && npm run dev

# Frontend (em outro terminal)
cd web && npm install && npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

## 📚 Próximas Leituras

- [API README](./api/README.md) - Configuração, variáveis de ambiente, endpoints
- [Web README](./web/README.md) - Instalação, estrutura, desenvolvimento

---

Feito com 💜 para a comunidade da AninhaCatTV
