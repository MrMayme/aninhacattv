import Image from 'next/image';
import { RankingUser } from '@/app/types/ranking';

interface RankingListProps {
  users: RankingUser[];
}

export default function RankingList({ users }: RankingListProps) {
  return (
    <div className="space-y-3 mt-8">
      {users.map((user, index) => (
        <div
          key={`${user.nick}-${index}`}
          className="grid grid-cols-[40px_1fr_100px] items-center gap-4 bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
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
                unoptimized={!user.avatar}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <span className="font-medium text-gray-800 truncate">
              {user.nick}
            </span>
          </div>
          <div className="text-right font-semibold text-gray-800">
            {user.horas}h
          </div>
        </div>
      ))}
    </div>
  );
}
