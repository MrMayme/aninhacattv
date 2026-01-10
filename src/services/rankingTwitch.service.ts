import prisma from "../lib/prisma.js";
import type { RankingDTO } from "../dtos/ranking.dto.js";

const MIN_MINUTES = 5;

function calculateMinutes(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export async function getTwitchRankingService(channel: string): Promise<RankingDTO[]> {
  const now = new Date();

  /**
   * 1️⃣ Buscar todas as sessões do canal
   */
  const sessions = await prisma.chatSession.findMany({
    where: {
      channel,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  /**
   * 2️⃣ Somar minutos por usuário
   */
  const minutesByUser = new Map<string, number>();

  for (const session of sessions) {
    const end = session.endedAt ?? now;
    const minutes = calculateMinutes(session.startedAt, end);

    const current = minutesByUser.get(session.user.username) ?? 0;
    minutesByUser.set(session.user.username, current + minutes);
  }

  /**
   * 3️⃣ Converter para RankingDTO
   */
  const ranking: RankingDTO[] = Array.from(minutesByUser.entries())
    .map(([user, minutes]) => ({
      user,
      minutes,
    }))
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