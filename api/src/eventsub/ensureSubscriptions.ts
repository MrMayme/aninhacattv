import axios from "axios";
import { getAppAccessToken } from "../services/twitchAppToken.service.js";
import { getValidTwitchToken } from "../services/twitchToken.service.js";
import { TwitchTokenType } from "../enum/TwitchTokenType.js";
import { debugToken } from "../services/twitchDebug.service.js";

const HELIX = "https://api.twitch.tv/helix";

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
      console.error(
        "❌ Erro removendo subscription:",
        err.response?.data || err.message
      );
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

  // ENSURE MAIN
export async function ensureEventSubSubscriptions() {
  console.log("🔄 Verificando EventSub subscriptions...");

  // App token → usado para criar webhook EventSub
  const appToken = await getAppAccessToken();

  // Bot token → apenas debug/chat
  const botToken = await getValidTwitchToken(TwitchTokenType.BOT);
  const botData = await debugToken(botToken);
  console.log("🤖 Bot autenticado:", botData.login);

  // Broadcaster token → só debug/validação
  const broadcasterToken = await getValidTwitchToken(TwitchTokenType.BROADCASTER);
  const broadcasterData = await debugToken(broadcasterToken);
  const broadcasterId = broadcasterData.user_id;
  console.log("🎤 Broadcaster autenticado:", broadcasterData.login);

  // LIST + CLEANUP
  let existing = await listSubscriptions(appToken);
  await cleanupSubscriptions(appToken, existing);
  existing = await listSubscriptions(appToken);

  // CHAT SUB → usar app token ?
  /*if (!existing.some((s) => s.type === "channel.chat.message")) {
    await createSubscription(appToken, "channel.chat.message", "1", {
      broadcaster_user_id: broadcasterId,
      user_id: botData.user_id
    });
  }*/

  // STREAM OFFLINE → usar app token
  /*if (!existing.some((s) => s.type === "stream.offline")) {
    await createSubscription(appToken, "stream.offline", "1", {
      broadcaster_user_id: broadcasterId,
    });
  }*/
  if (!existing.some((s) => s.type === "stream.offline" && s.condition?.broadcaster_user_id === broadcasterId)) {
      await createSubscription(appToken, "stream.offline", "1", {
        broadcaster_user_id: broadcasterId,
    });
  }
  console.log("🎉 EventSub pronto");
}