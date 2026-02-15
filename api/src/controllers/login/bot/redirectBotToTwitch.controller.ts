import crypto from "crypto"
import type { Request, Response } from "express"

export function redirectBotToTwitchController(_req: Request, res: Response) {
  const state = crypto.randomUUID()
  
  res.cookie("bot_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  })

  const scopes = [
    "moderator:read:chatters",
    "user:read:chat",
    "chat:read",
    "channel:read:subscriptions",
    "moderation:read"
  ];
  const scopeString = scopes.join(" ")
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    redirect_uri: process.env.TWITCH_BOT_REDIRECT_URI!,
    response_type: "code",
    //scope: "moderator:read:chatters",
    scope: scopeString,
    state,
  })

  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`)
}