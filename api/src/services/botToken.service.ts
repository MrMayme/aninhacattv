import prisma from "../lib/prisma.js"
import { refreshTwitchToken } from "../clients/twitch.client.js"

const EXPIRATION_MARGIN_MS = 5 * 60 * 1000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function refreshWithRetry(userId: string, refreshToken: string, attempt = 1): Promise<string> {
  try {
    const refreshed = await refreshTwitchToken(refreshToken)

    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

    await prisma.twitchToken.update({
      where: { userId },
      data: {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? refreshToken,
        expiresAt,
      },
    })

    return refreshed.access_token
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error("❌ Falha ao renovar token Twitch", err)
      throw err
    }

    console.warn(`⚠️ Retry refresh token (${attempt}/${MAX_RETRIES})`)
    await sleep(RETRY_DELAY_MS * attempt)

    return refreshWithRetry(userId, refreshToken, attempt + 1)
  }
}

export async function getValidBotToken(): Promise<string> {

  const botUsername = process.env.BOT_USERNAME
  
  if (!botUsername) {
    throw new Error("BOT_USERNAME não definido")
  }

  const bot = await prisma.user.findFirst({
    where: { username: botUsername },
    include: { twitchToken: true },
  })
  
  if (!bot || !bot.twitchToken) {
    throw new Error("BOT não autenticado")
  }

  const token = bot.twitchToken
  
  const now = Date.now()
  
  if (token.expiresAt.getTime() - now > EXPIRATION_MARGIN_MS) {
    return token.accessToken
  }

  return refreshWithRetry(bot.id, token.refreshToken)
}
