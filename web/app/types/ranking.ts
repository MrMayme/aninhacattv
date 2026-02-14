export interface RankingUser {
  nick: string;
  minutes?: number;
  messages?: number;
  score?: number;
  avatar?: string;
}

export interface RankingDataByType {
  mensal: RankingUser[];
  anual: RankingUser[];
  all: RankingUser[];
}

export interface RankingData {
  hours: RankingDataByType;
  messages: RankingDataByType;
  total: RankingDataByType;
}

export type TimePeriod = 'mensal' | 'anual' | 'all';
export type RankingType = 'hours' | 'messages' | 'total';
