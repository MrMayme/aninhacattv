import type { Request, Response } from "express"
import { exchangeCodeForToken, fetchTwitchUser } from "../../../clients/twitch.client.js";
import prisma from "../../../lib/prisma.js"
import { TwitchTokenType } from "../../../enum/TwitchTokenType.js";


export async function botCallbackController(req: Request, res: Response) {
  const code = req.query.code as string
  const state = req.query.state as string
  const savedState = req.cookies.bot_oauth_state

  if (!code || state !== savedState) {
    return res.status(401).json({ error: "OAuth inválido" })
  }

  const { access_token, refresh_token, expires_in } = await exchangeCodeForToken(code)

  const botUser = await fetchTwitchUser(access_token)

  const user = await prisma.user.upsert({
    where: { twitchId: botUser.id },
    update: {
      username: botUser.login,
      avatar: botUser.profile_image_url ?? null,
    },
    create: {
      twitchId: botUser.id,
      username: botUser.login,
      avatar: botUser.profile_image_url ?? null,
    },
  })

  await prisma.twitchToken.upsert({
    where: { userId: user.id },
    update: {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      type: (botUser.id == process.env.BROADCASTER_ID) ? TwitchTokenType.BROADCASTER : TwitchTokenType.BOT,      
    },
    create: {
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      type: (botUser.id == process.env.BROADCASTER_ID) ? TwitchTokenType.BROADCASTER : TwitchTokenType.BOT,
    },
  })

  res.clearCookie("bot_oauth_state")

  return res.json({ status: "BOT autenticado com sucesso" })
}