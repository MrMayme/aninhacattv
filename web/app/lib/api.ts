const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Cache para armazenar dados já carregados
const rankingCache = new Map<string, RankingUser[]>();
const loadingPromises = new Map<string, Promise<RankingUser[]>>();

interface ApiUser {
  user?: string;
  username?: string;
  nick?: string;
  minutes?: number;
  messages?: number;
  score?: number;
  avatar?: string;
  watchtime?: number;
  horas?: number;
  [key: string]: any;
}

interface RankingUser {
  nick: string;
  minutes?: number;
  messages?: number;
  score?: number;
  avatar?: string;
}

interface RankingDataByType {
  mensal: RankingUser[];
  anual: RankingUser[];
  all: RankingUser[];
}

interface RankingData {
  hours: RankingDataByType;
  messages: RankingDataByType;
  total: RankingDataByType;
}

export function formatarTempo(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h}h ${m}m`;
}

export function formatarMensagens(messages: number): string {
  return messages.toLocaleString('pt-BR');
}

function normalizeUserData(user: ApiUser, type: 'hours' | 'messages' | 'total'): RankingUser {
  const nick = user.nick || user.username || user.user || 'Unknown';
  const avatar = user.avatar;

  const normalized: RankingUser = { nick, avatar };

  if (type === 'hours' || type === 'total') {
    normalized.minutes = user.minutes || 0;
  }
  if (type === 'messages' || type === 'total') {
    normalized.messages = user.messages || 0;
  }
  if (type === 'total') {
    normalized.score = user.score || 0;
  }

  return normalized;
}

function getCacheKey(period: 'mensal' | 'anual' | 'all', type: 'hours' | 'messages' | 'total'): string {
  return `${type}:${period}`;
}

async function fetchRankingByPeriod(
  period: 'mensal' | 'anual' | 'all',
  type: 'hours' | 'messages' | 'total'
): Promise<RankingUser[]> {
  const cacheKey = getCacheKey(period, type);
  
  // Retorna do cache se já foi carregado
  if (rankingCache.has(cacheKey)) {
    return rankingCache.get(cacheKey)!;
  }
  
  // Evita requisições duplicadas retornando a promise já em andamento
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)!;
  }

  const endpoints = {
    hours: 'hour',
    messages: 'chat',
    total: 'hourandchat',
  };

  const promise = (async () => {
    try {
      const endpoint = endpoints[type];
      const response = await fetch(`${API_URL}/ranking/${endpoint}?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const rawData = await response.json();

      const users: RankingUser[] = Array.isArray(rawData)
        ? rawData.map((user) => normalizeUserData(user, type))
        : rawData.users?.map((user: ApiUser) => normalizeUserData(user, type)) || [];

      // Sort based on ranking type
      if (type === 'hours') {
        users.sort((a, b) => (b.minutes || 0) - (a.minutes || 0));
      } else if (type === 'messages') {
        users.sort((a, b) => (b.messages || 0) - (a.messages || 0));
      } else {
        users.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      // Armazena no cache
      rankingCache.set(cacheKey, users);
      loadingPromises.delete(cacheKey);
      
      return users;
    } catch (error) {
      loadingPromises.delete(cacheKey);
      throw error;
    }
  })();
  
  loadingPromises.set(cacheKey, promise);
  return promise;
}

// Carrega inicial apenas o tipo "total" com período "mensal"
export async function fetchInitialRanking(): Promise<RankingUser[]> {
  try {
    return await fetchRankingByPeriod('mensal', 'total');
  } catch (error) {
    console.error('Erro ao carregar ranking inicial:', error);
    throw error;
  }
}

// Carrega dados para um tipo e período específicos (lazy loading)
export async function fetchRankingData(
  type: 'hours' | 'messages' | 'total',
  period: 'mensal' | 'anual' | 'all'
): Promise<RankingUser[]> {
  try {
    return await fetchRankingByPeriod(period, type);
  } catch (error) {
    console.error(`Erro ao carregar ranking (${type}, ${period}):`, error);
    throw error;
  }
}

export async function fetchRanking(): Promise<RankingData> {
  try {
    const [
      hoursMonthly,
      hoursAnnual,
      hoursAll,
      messagesMonthly,
      messagesAnnual,
      messagesAll,
      totalMonthly,
      totalAnnual,
      totalAll,
    ] = await Promise.all([
      fetchRankingByPeriod('mensal', 'hours'),
      fetchRankingByPeriod('anual', 'hours'),
      fetchRankingByPeriod('all', 'hours'),
      fetchRankingByPeriod('mensal', 'messages'),
      fetchRankingByPeriod('anual', 'messages'),
      fetchRankingByPeriod('all', 'messages'),
      fetchRankingByPeriod('mensal', 'total'),
      fetchRankingByPeriod('anual', 'total'),
      fetchRankingByPeriod('all', 'total'),
    ]);

    return {
      hours: { mensal: hoursMonthly, anual: hoursAnnual, all: hoursAll },
      messages: { mensal: messagesMonthly, anual: messagesAnnual, all: messagesAll },
      total: { mensal: totalMonthly, anual: totalAnnual, all: totalAll },
    };
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    throw error;
  }
}
