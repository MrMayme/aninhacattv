import { RankingType } from '@/app/types/ranking';

interface RankingTypeButtonsProps {
  activeType: RankingType;
  onTypeChange: (type: RankingType) => void;
}

export default function RankingTypeButtons({
  activeType,
  onTypeChange,
}: RankingTypeButtonsProps) {
  const types: { label: string; value: RankingType; icon: string }[] = [
    { label: 'Horas', value: 'hours', icon: '⏱️' },
    { label: 'Mensagens', value: 'messages', icon: '💬' },
    { label: 'Total', value: 'total', icon: '🏆' },
  ];

  return (
    <div className="flex justify-center px-4 sm:px-6 pt-6 pb-4 sm:pb-6">
      {/* Segmented Control Container - Roxo Bold */}
      <div className="inline-flex rounded-lg sm:rounded-xl bg-purple-100 p-1.5 sm:p-2 gap-1.5 sm:gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`
              px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 md:py-3 rounded-lg font-semibold text-sm sm:text-sm md:text-base
              transition-all duration-200 whitespace-nowrap
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400
              ${
                activeType === type.value
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-purple-50'
              }
            `}
            aria-pressed={activeType === type.value}
            aria-label={`Filtrar por ${type.label}`}
          >
            <span className="mr-1.5 sm:mr-1.5 md:mr-2">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
