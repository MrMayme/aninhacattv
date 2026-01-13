import axios from "axios"
import { getValidBotToken } from "./botToken.service.js"

export async function isChannelLive(channelLogin: string): Promise<boolean> {
  const token = await getValidBotToken()

  const res = await axios.get(
    "https://api.twitch.tv/helix/streams",
    {
      params: {
        user_login: channelLogin,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
      },
    }
  )

  return res.data.data.length > 0
}