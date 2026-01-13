export interface RankingUser {
  nick: string;
  horas: number;
  avatar?: string;
}

export interface RankingData {
  mensal: RankingUser[];
  anual: RankingUser[];
  all: RankingUser[];
}

export type TimePeriod = 'mensal' | 'anual' | 'all';
