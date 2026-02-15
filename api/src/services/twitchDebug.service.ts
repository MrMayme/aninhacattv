import axios from "axios"

export async function debugToken(token:string) {
  try {

    const res = await axios.get(
      "https://id.twitch.tv/oauth2/validate",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return res.data

  } catch (err: any) {

    console.error(
      "❌ Falha ao validar token:",
      err.response?.data || err.message
    )

    throw err
  }
}