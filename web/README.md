# CatRank • AninhaCatTV

Landing page de ranking de viewers da comunidade da AninhaCatTV, desenvolvida com Next.js 16, React 19 e Tailwind CSS 4.

## 🐱 Sobre o Projeto

Uma plataforma elegante que exibe os viewers mais ativos da channel, com suporte a múltiplos períodos (Mensal, Anual, Todos os tempos). Os dados são sincronizados em tempo real com o backend e apresentam informações como horas assistidas e avatares dos usuários.

## 🚀 Tecnologias

- **Next.js 16** - React framework moderno com App Router
- **React 19** - Biblioteca UI com Suspense aprimorado
- **TypeScript 5** - Type safety completo
- **Tailwind CSS 4** - Estilização responsiva
- **ESLint 9** - Linting e qualidade de código

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend rodando em `http://localhost:3001`

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ▶️ Execução

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
web/
├── app/
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── RankingCard.tsx   # Card de usuário top 3
│   │   ├── RankingList.tsx   # Lista de outros usuários
│   │   ├── TabButtons.tsx    # Abas de período
│   │   ├── RankingContent.tsx # Componente principal
│   │   ├── RankingHeader.tsx # Cabeçalho
│   │   └── Footer.tsx        # Rodapé
│   ├── lib/
│   │   └── api.ts            # Chamadas à API do backend
│   ├── types/
│   │   └── ranking.ts        # Tipos TypeScript
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Página principal
├── public/                    # Arquivos estáticos
├── package.json
├── next.config.ts            # Configuração Next.js
├── tsconfig.json             # Configuração TypeScript
└── tailwind.config.ts        # Configuração Tailwind
```

## 🎨 Recursos

✨ **Design Responsivo** - Funciona perfeitamente em mobile, tablet e desktop  
🎭 **Animações Suaves** - Hover effects e glow effect nos cards  
🥇 **Badges de Medalhas** - 🥇🥈🥉 para os top 3  
⚡ **Otimização** - Next.js Image, lazy loading  
🔄 **Integração com API** - Sincronização automática de dados  
📊 **Múltiplos Períodos** - Mensal, Anual, Todos os tempos

## 🔌 API Backend

O projeto consome a rota `/auth/live` do backend com suporte a filtros por período:

### Endpoints

```bash
GET /auth/live?period=mensal   # Últimos 30 dias
GET /auth/live?period=anual    # Últimos 365 dias
GET /auth/live?period=all      # Todos os tempos (padrão)
GET /auth/live                 # Todos os tempos
```

### Resposta Esperada

```json
[
  {
    "user": "username",
    "minutes": 1034
  }
]
```

### Normalização de Dados

O frontend automaticamente:
- ✅ Mapeia `user` → `nick` (nomes dos usuários)
- ✅ Converte `minutes` → `horas` (divide por 60 e arredonda)
- ✅ Ordena por horas (decrescente)
- ✅ Gera avatares dinamicamente com [Dicebear API](https://dicebear.com)

## 🛠️ Desenvolvimento

### Adicionar novo componente

1. Criar arquivo em `app/components/`
2. Exportar como componente React
3. Importar em `RankingContent.tsx`

### Modificar estilos

Os estilos são definidos com Tailwind CSS. Edite as classes nos componentes ou adicione utilitários em `globals.css`.

### Debugar API

Verifique o console do navegador (F12) para ver as requisições e respostas da API.

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL do backend | `http://localhost:3001` |

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 Licença

Projeto desenvolvido para a comunidade da AninhaCatTV

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

Feito com 💜 para a comunidade da AninhaCatTV
