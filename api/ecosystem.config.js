/** @type {import('pm2').ProcessConfig[]} */
/*module.exports = [
  {
    name: "api-ngrok",          // Nome do processo dev
    script: "src/server.ts",        // Roda TS diretamente
    interpreter: "npx",             // Usando npx para tsx
    args: "tsx",                    // O comando tsx
    watch: true,                    // Watch para dev (hot reload)
    autorestart: true,              // Reinicia se crashar
    max_memory_restart: "300M",     // Reinicia se memória > 300MB
    env: {
      NODE_ENV: "development",
      PORT: 3000
    }
  },
  {
    name: "api-ngrok",         // Nome do processo produção
    script: "dist/server.js",       // JS compilado pelo tsc
    watch: false,                   // Não precisa watch em prod
    autorestart: true,
    max_memory_restart: "500M",     // Reinicia se memória > 500MB
    env: {
      NODE_ENV: "production",
      PORT: process.env.PORT || 3000
    }
  }
];*/

module.exports = {
  apps: [
    {
      name: "api-ngrok",
      script: "src/server.ts",
      interpreter: "npx",
      args: "tsx",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    },
  ],
};