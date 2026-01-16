export interface RankingUser {
  nick: string;
  minutes: number;
  avatar?: string;
}

export interface RankingData {
  mensal: RankingUser[];
  anual: RankingUser[];
  all: RankingUser[];
}

export type TimePeriod = 'mensal' | 'anual' | 'all';
