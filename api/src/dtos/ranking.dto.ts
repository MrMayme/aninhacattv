export interface RankingHourDTO {
  user: string;
  minutes: number;
  avatar?: string;
}

export interface RankingChatDTO {
  user: string;
  messages: number;
  avatar?: string;
}

export interface RankingHourAndChatDTO {
  user: string,
  minutes: number,
  messages: number,
  score: number,
  avatar?: string;
}