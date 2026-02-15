module.exports = {
  apps: [
    {
      name: "api",
      script: "src/server.ts",
      interpreter: "npx",
      args: "tsx",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    },
  ],
};