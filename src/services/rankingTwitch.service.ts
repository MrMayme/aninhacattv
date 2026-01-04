import prisma from "../lib/prisma.js";
import type { RankingDTO } from "../dtos/ranking.dto.js";

const MIN_MINUTES = 5;

function calculateMinutes(first: Date, last: Date): number {
  return Math.round(
    (last.getTime() - first.getTime()) / 60000
  );
}

function mapPresenceToRanking(p: {
  userLogin: string;
  firstSeen: Date;
  lastSeen: Date;
}): RankingDTO {
  return {
    user: p.userLogin,
    minutes: calculateMinutes(p.firstSeen, p.lastSeen),
  };
}

function hasMinimumTime(r: RankingDTO): boolean {
  return r.minutes >= MIN_MINUTES;
}

function sortByMinutesDesc(a: RankingDTO, b: RankingDTO) {
  return b.minutes - a.minutes;
}

export async function getTwitchRankingService(channel: string): Promise<RankingDTO[]> {
  const presences = await prisma.chatPresence.findMany({
    where: { channel },
  });

  return presences
    .map(mapPresenceToRanking)
    .filter(hasMinimumTime)
    .sort(sortByMinutesDesc);
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