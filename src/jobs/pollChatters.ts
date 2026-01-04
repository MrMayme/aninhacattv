import axios from "axios";
import prisma from "../lib/prisma.js";

const CHANNEL_LOGIN = "aninhacattv";

export function startChatPolling() {
  setInterval(pollChatters, 1 * 60_000); // 1 min
}

async function pollChatters() {
  try {
    const res = await axios.get(
      "https://api.twitch.tv/helix/chat/chatters",
      {
        params: {
          broadcaster_id: process.env.BROADCASTER_ID,
          moderator_id: process.env.MODERATOR_ID,
          first: 1000,
        },
        headers: {
          Authorization: `Bearer ${process.env.BOT_ACCESS_TOKEN}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        },
      }
    );

    const now = new Date();
    const chatters = res.data.data;

    for (const chatter of chatters) {
      await prisma.chatPresence.upsert({
        where: {
          userLogin_channel: {
            userLogin: chatter.user_login,
            channel: CHANNEL_LOGIN,
          },
        },
        update: {
          lastSeen: now,
        },
        create: {
          userLogin: chatter.user_login,
          channel: CHANNEL_LOGIN,
          firstSeen: now,
          lastSeen: now,
        },
      });
    }

    console.log(`📊 Chat atualizado (${chatters.length})`);
  } catch (err) {
    console.error("Erro no polling do chat", err);
  }
}