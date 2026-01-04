import  type { Request, Response } from "express"
import crypto from "crypto"

export function redirectToTwitchController(_req: Request, res: Response) {
  const state = crypto.randomUUID()

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, // 5 minutos
  })

  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    redirect_uri: process.env.TWITCH_REDIRECT_URI!,
    response_type: "code",
    scope: "user:read:email",
    state,
  })

  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`)
}