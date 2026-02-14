import Image from 'next/image';
import { RankingUser, RankingType } from '@/app/types/ranking';
import { formatarTempo, formatarMensagens } from '@/app/lib/api';

interface RankingCardProps {
  user: RankingUser;
  position: 0 | 1 | 2;
  type: RankingType;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['border-yellow-400', '', ''];

export default function RankingCard({ user, position, type }: RankingCardProps) {
  const getMetricDisplay = () => {
    switch (type) {
      case 'hours':
        return (
          <div className="text-gray-600 text-sm">
            {formatarTempo(user.minutes || 0)}
          </div>
        );
      case 'messages':
        return (
          <div className="text-gray-600 text-sm">
            {formatarMensagens(user.messages || 0)} mensagens
          </div>
        );
      case 'total':
        return (
          <div className="space-y-1">
            <div className="text-lg font-bold text-purple-600">
              {(user.score || 0).toLocaleString('pt-BR')} <span className="text-sm text-gray-500">pts</span>
            </div>
            <div className="text-xs text-gray-500">
              {formatarTempo(user.minutes || 0)} • {formatarMensagens(user.messages || 0)} msg
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`
        bg-white rounded-2xl p-6 text-center shadow-lg
        transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1.5
        ${position === 0 ? `border-4 ${MEDAL_COLORS[0]} animate-pulse` : ''}
      `}
    >
      <div className="relative w-18 h-18 mx-auto mb-4">
        <Image
          src={user.avatar || `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.nick}`}
          alt={user.nick}
          width={72}
          height={72}
          unoptimized={true}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
      <div className="font-bold text-lg mb-2">
        {MEDALS[position]} {user.nick}
      </div>
      {getMetricDisplay()}
    </div>
  );
}
