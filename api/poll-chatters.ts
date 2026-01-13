import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pollChattersHandler } from './src/jobs/pollChatters.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await pollChattersHandler();
    res.status(200).json({ message: 'Polling executado com sucesso' });
  } catch (err) {
    console.error('❌ Erro no polling serverless', err);
    res.status(500).json({ error: 'Erro ao executar polling' });
  }
}