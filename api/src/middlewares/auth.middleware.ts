import rateLimit from 'express-rate-limit'

export const rankingRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutos
  max: 2000,                    // até 600 tentativas 1 tentativa = 6 gastos +- 10
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas, tente novamente mais tarde.' },
})