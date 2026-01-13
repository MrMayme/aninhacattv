import axios from "axios";
import type { TwitchUserDTO } from "../dtos/twitchUser.dto.js";
import type { TwitchTokenResponse } from "../dtos/twitchToken.dto.js";

export async function exchangeCodeForToken(code: string) {
  const response = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      },
    }
  );
  
  return response.data;
}

export async function refreshTwitchToken(refreshToken: string): Promise<TwitchTokenResponse> {
  const response = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    }
  );
  
  return response.data
}

export async function fetchTwitchUser(access_token: string): Promise<TwitchUserDTO> {
  const response = await axios.get(
    "https://api.twitch.tv/helix/users",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
      },
    }
  );

  return response.data.data[0];
}