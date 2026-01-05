import axios from "axios";
import prisma from "../lib/prisma.js";
import { getValidBotToken } from "../services/botToken.service.js"

const CHANNEL_LOGIN = "aninhacattv";

export function startChatPolling() {
  setInterval(pollChatters, 1 * 60_000); // 1 min
}

async function pollChatters() {
  try {
    const accessToken = await getValidBotToken()

    const res = await axios.get(
      "https://api.twitch.tv/helix/chat/chatters",
      {
        params: {
          broadcaster_id: process.env.BROADCASTER_ID,
          moderator_id: process.env.MODERATOR_ID,
          first: 1000,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        },
      }
    );

    const now = new Date();
    const chatters = res.data.data;
    console.log("chatters: ", chatters)
    for (const chatter of chatters) {
    
      let user = await prisma.user.findFirst({
        where: {
          username: chatter.user_login,
        },
      })
      console.log("user: ", user)
      if (!user) {
        user = await prisma.user.create({
          data: {
            twitchId: chatter.user_id, // vem da API
            username: chatter.user_login,
          },
        })
      }

      const chartPresence = await prisma.chatPresence.upsert({
        where: {
          userId_channel: {
            userId: user.id,
            channel: CHANNEL_LOGIN,
          },
        },
        update: {
          lastSeen: now,
        },
        create: {
          userId: user.id,
          channel: CHANNEL_LOGIN,
          firstSeen: now,
          lastSeen: now,
        },
      })
      console.log("chartPresence: ", chartPresence)
    }

    console.log(`📊 Chat atualizado (${chatters.length})`)
  } catch (err) {
    console.error("Erro no polling do chat", err)
  }
}