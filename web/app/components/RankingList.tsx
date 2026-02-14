import Image from 'next/image';
import { RankingUser, RankingType } from '@/app/types/ranking';
import { formatarTempo, formatarMensagens } from '@/app/lib/api';

import { TimePeriod } from '@/app/types/ranking';

interface RankingListProps {
  users: RankingUser[];
  type: RankingType;
  activeTab: TimePeriod;
}

export default function RankingList({ users, type, activeTab }: RankingListProps) {
  const getMetricDisplay = (user: RankingUser) => {
    switch (type) {
      case 'hours':
        return (
          <div className="text-right font-semibold text-gray-800">
            {formatarTempo(user.minutes || 0)}
          </div>
        );
      case 'messages':
        return (
          <div className="text-right font-semibold text-gray-800">
            {formatarMensagens(user.messages || 0)}
          </div>
        );
      case 'total':
        return (
          <div className="text-right">
            <div className="font-bold text-purple-600">
              {(user.score || 0).toLocaleString('pt-BR')} <span className="text-xs text-gray-500">pts</span>
            </div>
            <div className="text-xs text-gray-500">
              {formatarTempo(user.minutes || 0)}
            </div>
          </div>
        );
    }
  };

  const getColumnGrid = () => {
    if (type === 'total') {
      return 'grid-cols-[40px_1fr_120px]';
    }
    return 'grid-cols-[40px_1fr_100px]';
  };

  return (
    <div className="space-y-3 mt-8">
      {users.map((user, index) => (
        <div
          key={`${activeTab}-${type}-${user.nick}-${index}`}
          className={`grid ${getColumnGrid()} items-center gap-4 bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow`}
        >
          <div className="font-bold text-lg text-gray-800 text-center">
            {index + 4}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={user.avatar || `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.nick}`}
                alt={user.nick}
                width={40}
                height={40}
                unoptimized={true}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <span className="font-medium text-gray-800 truncate">
              {user.nick}
            </span>
          </div>
          {getMetricDisplay(user)}
        </div>
      ))}
    </div>
  );
}
