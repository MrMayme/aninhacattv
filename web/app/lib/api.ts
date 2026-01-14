const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiUser {
  user?: string;
  username?: string;
  nick?: string;
  minutes?: number;
  avatar?: string;
  watchtime?: number;
  horas?: number;
  [key: string]: any;
}

interface RankingUser {
  nick: string;
  horas: number;
  avatar?: string;
}

interface RankingData {
  mensal: RankingUser[];
  anual: RankingUser[];
  all: RankingUser[];
}

function normalizeUserData(user: ApiUser): RankingUser {
  // Mapear user → nick (pode vir como 'user', 'username', ou 'nick')
  const nick = user.nick || user.username || user.user || 'Unknown';
  
  // Converter minutos para horas (backend retorna minutos)
  const minutes = user.minutes || 0;
  const horas = Math.round(minutes / 60);
  
  const avatar = user.avatar;

  return { nick, horas, avatar };
}

async function fetchRankingByPeriod(period: 'mensal' | 'anual' | 'all'): Promise<RankingUser[]> {
  const response = await fetch(`${API_URL}/auth/live?period=${period}`, {
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
    ? rawData.map(normalizeUserData)
    : rawData.users?.map(normalizeUserData) || [];

  users.sort((a, b) => b.horas - a.horas);
  return users;
}

export async function fetchRanking(): Promise<RankingData> {
  try {
    const [mensal, anual, all] = await Promise.all([
      fetchRankingByPeriod('mensal'),
      fetchRankingByPeriod('anual'),
      fetchRankingByPeriod('all'),
    ]);

    return { mensal, anual, all };
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    throw error;
  }
}
