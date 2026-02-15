import prisma from "../../lib/prisma.js";
import type { RankingChatDTO } from "../../dtos/ranking.dto.js";

const MIN_MESSAGES = 0;

const excludedUserIds = [
  "cmk89ic30000fx4r4nx86vza1", // streamelements
  "cmk89ic3s000lx4r4ycf0ktcp", // botrix
  "cmk89ic45000ox4r49400omqu", // creatisbot
  "cmk89ic3e000ix4r4tklehniz", // aninhacattv
];

function getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = now;
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

  return { startDate, endDate };
}

export async function getTwitchChatRankingService(
  channel: string,
  period: string = "all"
): Promise<RankingChatDTO[]> {

  const { startDate } = getDateRangeForPeriod(period);

  /**
   * 1️⃣ Buscar sessões do canal
   */
  const sessions = await prisma.chatSession.findMany({
    where: {
      channel,
      startedAt: {
        gte: startDate,
      },
      NOT: {
        user: {
          id: {
            in: excludedUserIds,
          },
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
   * 2️⃣ Somar mensagens por usuário
   */
  const messagesByUser = new Map<string, number>();
  const avatarByUser = new Map<string, string | null>();

  for (const session of sessions) {
    const messages = session.messageCount ?? 0;
    const current = messagesByUser.get(session.user.username) ?? 0;
    messagesByUser.set(session.user.username, current + messages);

    if (!avatarByUser.has(session.user.username)) {
      avatarByUser.set(session.user.username, session.user.avatar);
    }
  }

  /**
   * 3️⃣ Converter ranking
   */
  const ranking: RankingChatDTO[] = Array.from(messagesByUser.entries())
    .map(([user, messages]) => {
      const avatar = avatarByUser.get(user);
      
      return {
        user,
        messages,
        ...(avatar ? { avatar } : {}),
      };
    })
    .filter(r => r.messages >= MIN_MESSAGES)
    .sort((a, b) => b.messages - a.messages);

  return ranking;
}