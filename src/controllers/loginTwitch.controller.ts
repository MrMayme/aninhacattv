import type { Request, Response } from "express";
import { loginTwitchService } from "../services/loginTwitch.service.js";

export async function loginTwitchController(req: Request, res: Response) {
  
  const code = req.query.code as string | undefined
  const state = req.query.code as string | undefined
  const savedState = req.cookies.oauth_state

  if (!code || !state) {
    return res.status(400).json({ error: "Code ou state ausente" })
  }

  if (state !== savedState) {
    return res.status(401).json({ error: "State inválido (CSRF)" })
  }

  await loginTwitchService(code)

  res.clearCookie("oauth_state")

  return res.redirect(`${process.env.FRONTEND_URL}/dashboard`)

}

