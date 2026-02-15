import axios from "axios";
import tmi from "tmi.js";
import { getAppAccessToken } from "../services/twitchAppToken.service.js";
import { getValidTwitchToken } from "../services/twitchToken.service.js";
import { TwitchTokenType } from "../enum/TwitchTokenType.js";
import { debugToken } from "../services/twitchDebug.service.js";
import { handleChatMessage } from "../eventsub/chat.js";
import { isChannelLive } from "../services/twitchStatus.service.js";

const HELIX = "https://api.twitch.tv/helix";
const CHANNEL_LOGIN = "aninhacattv";

function getHeaders(token: string) {
  return {
    "Client-Id": process.env.TWITCH_CLIENT_ID!,
    Authorization: `Bearer ${token}`,
  };
}

  // LIST SUBSCRIPTIONS
async function listSubscriptions(token: string) {
  const res = await axios.get(`${HELIX}/eventsub/subscriptions`, {
    headers: getHeaders(token),
  });
  
  return res.data.data as any[];
}

  // CLEANUP INVALID SUBS
async function cleanupSubscriptions(token: string, subs: any[]) {
  
  for (const sub of subs) {
    const invalid =
      sub.status !== "enabled" ||
      sub.transport.callback !== process.env.EVENTSUB_CALLBACK_URL;

    if (!invalid) continue;

    try {
      console.log(`🧹 Removendo subscription inválida: ${sub.type}`);
      await axios.delete(`${HELIX}/eventsub/subscriptions`, {
        headers: getHeaders(token),
        params: { id: sub.id },
      });
    } catch (err: any) {
      console.error("❌ Erro removendo subscription:", err.response?.data || err.message);
    }
  }
}

  // CREATE SUB
async function createSubscription(
  token: string,
  type: string,
  version: string,
  condition: Record<string, string>
) {
  try {
    await axios.post(
      `${HELIX}/eventsub/subscriptions`,
      {
        type,
        version,
        condition,
        transport: {
          method: "webhook",
          callback: process.env.EVENTSUB_CALLBACK_URL,
          secret: process.env.TWITCH_EVENTSUB_SECRET,
        },
      },
      { headers: getHeaders(token) }
    );

    console.log(`✅ EventSub criado: ${type}`);
  } catch (err: any) {
    console.error(`❌ Falha ao criar ${type}:`, err.response?.data || err.message);
  }
}

  // ENSURE EVENTSUB + CHAT BOT
export async function initTwitchIntegration() {
  console.log("🔄 Inicializando Twitch Integration...");

  // App token → para EventSub
  const appToken = await getAppAccessToken();

  // Bot token → para chatgetValidTwitchToken
  const botToken = await getValidTwitchToken(TwitchTokenType.BOT);
  const botData = await debugToken(botToken);
  console.log("🤖 Bot autenticado:", botData.login);

  // Broadcaster token → validações
  const broadcasterToken = await getValidTwitchToken(TwitchTokenType.BROADCASTER);
  const broadcasterData = await debugToken(broadcasterToken);
  const broadcasterId = broadcasterData.user_id;
  console.log("🎤 Broadcaster autenticado:", broadcasterData.login);

  // LIST + CLEANUP EVENTSUB
  let existing = await listSubscriptions(appToken);
  await cleanupSubscriptions(appToken, existing);
  existing = await listSubscriptions(appToken);

  // CREATE VALID EVENTSUBS
  const eventSubs = [
    { type: "stream.online", condition: { broadcaster_user_id: broadcasterId } },
    { type: "stream.offline", condition: { broadcaster_user_id: broadcasterId } },
    { type: "channel.subscribe", condition: { broadcaster_user_id: broadcasterId } },
  ];

  for (const sub of eventSubs) {
    if (!existing.some((s) => s.type === sub.type)) {
      await createSubscription(appToken, sub.type, "1", sub.condition);
    }
  }

  console.log("🎉 EventSub pronto");

  // CONNECT BOT (tmi.js) → CHAT
  const client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: botData.login,
      password: `oauth:${botToken}`,
    },
    channels: [broadcasterData.login],
  });

  client.connect();

  client.on("connected", () => {
    console.log(`🚀 Bot conectado no chat de ${broadcasterData.login}`);
  });

  client.on("message", async (channel: any, tags: any, message: any, self: any) => {
    if (self) return;
    console.log(`[CHAT] ${tags.username}: ${message}`);
    
    const event = {
      chatter_user_id: tags["user-id"],
      chatter_user_login: tags.username,
      broadcaster_user_login: channel.replace("#", ""),
      broadcaster_user_id: tags["room-id"],
    };

    const isLive = await isChannelLive(CHANNEL_LOGIN);
    if(isLive){
      await handleChatMessage(event);
    }

  });

  console.log("💬 Chat Bot pronto para mensagens");
  
}