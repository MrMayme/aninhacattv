import prisma from "../lib/prisma.js"
import { refreshTwitchToken } from "../clients/twitch.client.js"
import { TwitchTokenType } from "../enum/TwitchTokenType.js"

const EXPIRATION_MARGIN_MS = 5 * 60 * 1000 // 5 minutos
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function refreshWithRetry(
  tokenId: string,
  refreshToken: string,
  attempt = 1,
): Promise<string> {
  try {
    const refreshed = await refreshTwitchToken(refreshToken)

    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

    await prisma.twitchToken.update({
      where: { id: tokenId },
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

    return refreshWithRetry(tokenId, refreshToken, attempt + 1)
  }
}

export async function getValidTwitchToken(
  type: TwitchTokenType,
): Promise<string> {
  const token = await prisma.twitchToken.findUnique({
    where: { type },
  })
 
  if (!token) {
    throw new Error(`Token Twitch do tipo ${type} não encontrado`)
  }

  if (!token.refreshToken?.trim()) {
    throw new Error("Refresh token inválido")
  }

  const now = Date.now()

  if (token.expiresAt.getTime() - now > EXPIRATION_MARGIN_MS) {
    return token.accessToken
  }

  return refreshWithRetry(token.id, token.refreshToken)
}