import axios from "axios";
import prisma from "../lib/prisma.js";
import { isChannelLive } from "../services/twitchStatus.service.js"
import { getValidBotToken } from "../services/botToken.service.js"

const CHANNEL_LOGIN = "aninhacattv";

const EXCLUDED_USER_IDS = new Set<string>([
  "100135110",      // streamelements
  "646848961",      // botrix
  "541450924",      // creatisbot
]);

// controle REAL do polling
let chatPollingInterval: NodeJS.Timeout | null = null;

// evita overlap de execução
let shouldPoll = false;
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
  if (chatPollingInterval) return; // se já está executando

  console.log("🔴 Canal AO VIVO — iniciando chat polling");
  
  shouldPoll = true;

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

  shouldPoll = false;

  clearInterval(chatPollingInterval);
  chatPollingInterval = null;

  // encerra todas as sessões abertas
  await prisma.chatSession.updateMany({
    where: {
      channel: CHANNEL_LOGIN,
      endedAt: null,
    },
    data: {
      endedAt: new Date(),
    },
  });
  
  // atualiza avatar
  const maximumUsersWithoutAvatar: string[] = [];
  
  const users = await prisma.user.findMany({
    where: { avatar: null },
    orderBy: { id: 'asc' },
    take: 100,
    select: {
      twitchId: true,
    },
  });

  if(users.length > 0) {
    
    const twitchIds = users.map(u => u.twitchId);
  
    const accessToken = await getValidBotToken();
  
    const usersRes = await axios.get(
          "https://api.twitch.tv/helix/users",
          {
            params: { id: twitchIds },
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Client-Id": process.env.TWITCH_CLIENT_ID!,
            },
          }
        );
  
        await prisma.$transaction(
          usersRes.data.data.map((u: any) =>
            prisma.user.update({
              where: { twitchId: u.id },
              data: {
                avatar: u.profile_image_url,
              },
            })
          )
        );
        
  }

}

async function pollChatters() {
  if (!shouldPoll) {
    console.log("⛔ Poll cancelado antes de iniciar");
    return;
  }

  if (isPolling) return;

  isPolling = true;

  try {
    const accessToken = await getValidBotToken();

    if (!shouldPoll) return;

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

    if (!shouldPoll) return;

    const now = new Date();
    const chatters = res.data.data;

    // Quem está no chat agora
    const currentLogins = new Set(
      chatters.map((c: any) => c.user_login)
    );

    const usersWithoutAvatar: string[] = [];
    
    // TRANSACTION
    await prisma.$transaction(async tx => {

    // Sessões ativas no banco
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
      activeSessions.map((s:any) => [s.user.username, s])
    );

    // Usuários que SAÍRAM do chat → fechar sessão
    for (const session of activeSessions) {
      if (!currentLogins.has(session.user.username)) {
        await prisma.chatSession.update({
          where: { id: session.id },
          data: { endedAt: now },
        });
      }
    }
    
    // Usuários que ENTRARAM no chat → nova sessão
    for (const chatter of chatters) {
      if (!activeMap.has(chatter.user_login)) {
        
        const user = await prisma.user.upsert({
          where: {
            twitchId: chatter.user_id,
          },
          update: {
            username: chatter.user_login,
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

      if (activeMap.has(chatter.user_login)) {
        
        const user = await prisma.user.findUnique({
          where: {
            twitchId: chatter.user_id, // 🔑 fixo
          },          
        });

        if (user && !user.avatar) {
          usersWithoutAvatar.push(user.twitchId);
        }
      }

    }
    }); // end transaction

        // 🖼️ buscar avatar UMA VEZ
    if (usersWithoutAvatar.length > 0) {
      const usersRes = await axios.get(
        "https://api.twitch.tv/helix/users",
        {
          params: { id: usersWithoutAvatar },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID!,
          },
        }
      );

      await prisma.$transaction(
        usersRes.data.data.map((u: any) =>
          prisma.user.update({
            where: { twitchId: u.id },
            data: {
              avatar: u.profile_image_url,
            },
          })
        )
      );
      
    }
    
    // console.log(`📊 Sessões de chat atualizadas (${chatters.length})`);
  } catch (err) {
    console.error("❌ Erro no polling do chat", err);
  } finally {
    isPolling = false;
  }
}