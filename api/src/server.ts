import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import ngrok from "@ngrok/ngrok";
import routes from "./routes/index.js";
import { initChatPollingIfLive } from "./jobs/pollChatters.js";
import { initTwitchIntegration } from "./integrations/twitch.integration.js";

const app = express();

const PORT = process.env.PORT || 3000;

function logTime() {
  return new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

// CRASH HANDLERS
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1); // PM2 reinicia
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
  process.exit(1); // PM2 reinicia
});

// PROXY (OBRIGATÓRIO PARA NGROK / RATE LIMIT)
app.set("trust proxy", 1);

// LOG DO IP REAL
/*app.use((req, res, next) => {
  console.log(`📌 ========${logTime()}========`);
  console.log("📌 IP real do usuário:", req.ip);
  console.log("📌 Todos os IPs (X-Forwarded-For):", req.ips);
  next();
});*/

// IMEOUT ANTI-SLOW REQUEST
app.use((req, res, next) => {
  req.setTimeout(10_000);
  res.setTimeout(10_000);
  next();
});

// CORS Configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);

  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// BODY LIMIT (ANTI-FLOOD)-?:
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Middleware
//app.use(express.json());
app.use(cookieParser());
app.use(routes);

// Server
app.listen(PORT, async () => {
  console.log(`🚀 ========${logTime()}========`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);  
});

// NGROK
async function startNgrok() {
  while (true) {
    try {
      const listener = await ngrok.connect({ addr: PORT, authtoken_from_env: true })
      console.log(`🌍 ========${logTime()}========`);
      console.log(`🌍 Ngrok tunnel active: ${listener.url()}`);
      break;
    } catch (err) {
      console.log(`❌ ========${logTime()}========`);
      console.error("❌ Ngrok failed, retrying in 5s...", err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

startNgrok();

// Inicia Twitch Integration
initTwitchIntegration().catch(console.error);

// Job
setInterval(() => {
  initChatPollingIfLive()
}, 5 * 60_000)