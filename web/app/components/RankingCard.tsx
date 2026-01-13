import Image from 'next/image';
import { RankingUser } from '@/app/types/ranking';

interface RankingCardProps {
  user: RankingUser;
  position: 0 | 1 | 2;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['border-yellow-400', '', ''];

export default function RankingCard({ user, position }: RankingCardProps) {
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
          unoptimized={!user.avatar}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
      <div className="font-bold text-lg mb-1">
        {MEDALS[position]} {user.nick}
      </div>
      <div className="text-gray-600 text-sm">
        {user.horas}h assistidas
      </div>
    </div>
  );
}
