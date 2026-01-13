import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { getValidBotToken } from "../services/botToken.service.js";

const CHANNEL_LOGIN = "aninhacattv";

export async function pollChattersHandler() {
  try {
    const accessToken = await getValidBotToken();

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

    // 🔑 Quem está no chat agora
    const currentLogins = new Set(chatters.map((c: any) => c.user_login));

    // 🔑 Sessões ativas
    const activeSessions = await prisma.chatSession.findMany({
      where: {
        channel: CHANNEL_LOGIN,
        endedAt: null,
      },
      include: { user: { select: { username: true } } },
    });

    const activeMap = new Map(activeSessions.map(s => [s.user.username, s]));

    // 🔹 Fechar sessões de quem saiu do chat
    for (const session of activeSessions) {
      if (!currentLogins.has(session.user.username)) {
        await prisma.chatSession.update({
          where: { id: session.id },
          data: { endedAt: now },
        });
      }
    }

    // 🔹 Criar sessões para quem entrou no chat
    for (const chatter of chatters) {
      if (!activeMap.has(chatter.user_login)) {
        const user = await prisma.user.upsert({
          where: { twitchId: chatter.user_id },
          update: { username: chatter.user_login },
          create: {
            twitchId: chatter.user_id,
            username: chatter.user_login,
          },
        });

        await prisma.chatSession.create({
          data: {
            userId: user.id,
            channel: CHANNEL_LOGIN,
            startedAt: now,
          },
        });
      }
    }

    console.log(`📊 Sessões de chat atualizadas (${chatters.length})`);
  } catch (err) {
    console.error("❌ Erro no polling do chat", err);
  }
}