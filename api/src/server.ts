import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);

  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(routes);

export default app;