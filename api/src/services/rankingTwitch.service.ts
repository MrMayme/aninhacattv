import { prisma } from "../lib/prisma.js";
import type { RankingDTO } from "../dtos/ranking.dto.js";

const MIN_MINUTES = 5;

function calculateMinutes(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

function getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = now;
  let startDate: Date;

  switch (period.toLowerCase()) {
    case "mensal":
      // Últimos 30 dias
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "anual":
      // Últimos 365 dias
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    case "all":
    default:
      // Todos os tempos (data bem antiga)
      startDate = new Date("2000-01-01");
      break;
  }

  return { startDate, endDate };
}

export async function getTwitchRankingService(
  channel: string,
  period: string = "all"
): Promise<RankingDTO[]> {
  const now = new Date();
  const { startDate } = getDateRangeForPeriod(period);

  /**
   * 1️⃣ Buscar todas as sessões do canal dentro do período
   */
  const sessions = await prisma.chatSession.findMany({
    where: {
      channel,
      startedAt: {
        gte: startDate,
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
   * 2️⃣ Somar minutos por usuário e armazenar avatar
   */
  const minutesByUser = new Map<string, number>();
  const avatarByUser = new Map<string, string | null>();

  for (const session of sessions) {
    const end = session.endedAt ?? now;
    const minutes = calculateMinutes(session.startedAt, end);

    const current = minutesByUser.get(session.user.username) ?? 0;
    minutesByUser.set(session.user.username, current + minutes);
    
    // Armazenar avatar do usuário (pega apenas uma vez)
    if (!avatarByUser.has(session.user.username)) {
      avatarByUser.set(session.user.username, session.user.avatar);
    }
  }

  /**
   * 3️⃣ Converter para RankingDTO com avatar
   */
  const ranking: RankingDTO[] = Array.from(minutesByUser.entries())
    .map(([user, minutes]) => {
      const avatar = avatarByUser.get(user);
      return {
        user,
        minutes,
        ...(avatar ? { avatar } : {}),
      };
    })
    .filter(r => r.minutes >= MIN_MINUTES)
    .sort((a, b) => b.minutes - a.minutes);

  return ranking;
}

/**
 * function loginDuranteALive(
  loginAt: Date,
  presence: { firstSeen: Date; lastSeen: Date }
) {
  return (
    loginAt >= presence.firstSeen &&
    loginAt <= presence.lastSeen
  );
}
 */