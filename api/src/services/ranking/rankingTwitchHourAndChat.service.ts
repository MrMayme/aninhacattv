import prisma from "../../lib/prisma.js";
import type { RankingHourAndChatDTO } from "../../dtos/ranking.dto.js";

const MIN_SCORE = 5;

const excludedUserIds = [
  "cmk89ic30000fx4r4nx86vza1",
  "cmk89ic3s000lx4r4ycf0ktcp",
  "cmk89ic45000ox4r49400omqu",
  "cmk89ic3e000ix4r4tklehniz",
];

const MINUTE_WEIGHT = 1;
const MESSAGE_WEIGHT = 2;

function calculateMinutes(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

function getDateRangeForPeriod(period: string) {
  const now = new Date();
  let startDate: Date;

  switch (period.toLowerCase()) {
    case "mensal":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "anual":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    case "all":
    default:
      startDate = new Date("2000-01-01");
      break;
  }

  return { startDate, now };
}

export async function getTwitchHourAndChatRankingService(
  channel: string,
  period: string = "all"
) {

  const { startDate, now } = getDateRangeForPeriod(period);

  /**
   * 1️⃣ Buscar sessões
   */
  const sessions = await prisma.chatSession.findMany({
    where: {
      channel,
      startedAt: { gte: startDate },
      NOT: {
        user: {
          id: { in: excludedUserIds },
        },
      },
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });

  /**
   * 2️⃣ Acumuladores
   */
  const minutesByUser = new Map<string, number>();
  const messagesByUser = new Map<string, number>();
  const avatarByUser = new Map<string, string | null>();

  for (const session of sessions) {

    // ---------- minutos ----------
    const end = session.endedAt ?? now;
    const minutes = calculateMinutes(session.startedAt, end);

    const currentMinutes = minutesByUser.get(session.user.username) ?? 0;
    minutesByUser.set(session.user.username, currentMinutes + minutes);

    // ---------- mensagens ----------
    const currentMessages = messagesByUser.get(session.user.username) ?? 0;
    messagesByUser.set(
      session.user.username,
      currentMessages + (session.messageCount ?? 0)
    );

    // ---------- avatar ----------
    if (!avatarByUser.has(session.user.username)) {
      avatarByUser.set(session.user.username, session.user.avatar);
    }
  }

  /**
   * 3️⃣ Criar ranking ponderado
   */
  const users = new Set([
    ...minutesByUser.keys(),
    ...messagesByUser.keys(),
  ]);

  const ranking: RankingHourAndChatDTO[] = Array.from(users)
    .map(user => {

      const minutes = minutesByUser.get(user) ?? 0;
      const messages = messagesByUser.get(user) ?? 0;
      const avatar = avatarByUser.get(user);

      const score =
        minutes * MINUTE_WEIGHT +
        messages * MESSAGE_WEIGHT;

      return {
        user,
        minutes,
        messages,
        score,
        ...(avatar ? { avatar } : {}),
        //avatar: avatarByUser.get(user) ?? undefined,
      };
    })
    .filter(r => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  return ranking;
}