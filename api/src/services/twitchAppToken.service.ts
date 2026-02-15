import axios from "axios"

let cachedToken: string | null = null
let expiresAt = 0

export async function getAppAccessToken(): Promise<string> {

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch client credentials")
  }

  // Usa cache se ainda válido
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken
  }

  const res = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      },
    }
  )

  const token = res.data.access_token
  const expiresIn = res.data.expires_in
  
  if (!token || !expiresIn) {
    throw new Error("Failed to obtain Twitch app token")
  }

  cachedToken = token

  if(!cachedToken) {
    throw new Error("Failed to obtain Twitch app token")
  }

  // ⭐ margem de segurança
  expiresAt = Date.now() + (expiresIn - 60) * 1000

  return cachedToken
}