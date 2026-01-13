import axios from "axios";
import prisma from "../lib/prisma.js";
import { isChannelLive } from "../services/twitchStatus.service.js"
import { getValidBotToken } from "../services/botToken.service.js"

const CHANNEL_LOGIN = "aninhacattv";

// 🔑 controle REAL do polling
let chatPollingInterval: NodeJS.Timeout | null = null;

// 🔒 evita overlap de execução
let isPolling = false;

export async function initChatPollingIfLive() {
  const isLive = await isChannelLive(CHANNEL_LOGIN);

  if (isLive) {
    startChatPolling();
  } else {
    await stopChatPolling();
  }
}

function startChatPolling() {
  if (chatPollingInterval) return; // já está rodando

  console.log("🔴 Canal AO VIVO — iniciando chat polling");

  // 🚀 primeira execução imediata
  pollChatters();

  chatPollingInterval = setInterval(
    pollChatters,
    5 * 60_000 // 5 minutos
  );
}

async function stopChatPolling() {
  if (!chatPollingInterval) return;

  console.log("⚫ Canal OFFLINE — polling pausado");

  clearInterval(chatPollingInterval);
  chatPollingInterval = null;

  // 🔚 encerra todas as sessões abertas
  await prisma.chatSession.updateMany({
    where: {
      channel: CHANNEL_LOGIN,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  });
}

async function pollChatters() {
  if (isPolling) {
    console.warn("⏳ Poll ainda em execução, pulando ciclo...");
    return;
  }

  isPolling = true;

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

    /**
     * 1️⃣ Quem está no chat agora
     */
    const currentLogins = new Set(
      chatters.map((c: any) => c.user_login)
    );

    /**
     * 2️⃣ Sessões ativas no banco
     */
    const activeSessions = await prisma.chatSession.findMany({
      where: {
        channel: CHANNEL_LOGIN,
        endedAt: null,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const activeMap = new Map(
      activeSessions.map(s => [s.user.username, s])
    );

    /**
     * 3️⃣ Usuários que SAÍRAM do chat → fechar sessão
     */
    for (const session of activeSessions) {
      if (!currentLogins.has(session.user.username)) {
        await prisma.chatSession.update({
          where: { id: session.id },
          data: { endedAt: now },
        });
      }
    }

    /**
     * 4️⃣ Usuários que ENTRARAM no chat → nova sessão
     */
    for (const chatter of chatters) {
      if (!activeMap.has(chatter.user_login)) {
        const user = await prisma.user.upsert({
          where: {
            twitchId: chatter.user_id, // 🔑 fixo
          },
          update: {
            username: chatter.user_login, // 🔄 atualiza se mudou
          },
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
  } finally {
    isPolling = false;
  }
}