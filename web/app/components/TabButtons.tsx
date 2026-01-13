import { TimePeriod } from '@/app/types/ranking';

interface TabButtonsProps {
  activeTab: TimePeriod;
  onTabChange: (tab: TimePeriod) => void;
}

export default function TabButtons({ activeTab, onTabChange }: TabButtonsProps) {
  const tabs: { label: string; value: TimePeriod }[] = [
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' },
    { label: 'Todos os tempos', value: 'all' },
  ];

  return (
    <div className="flex justify-center gap-4 my-8 flex-wrap px-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            activeTab === tab.value
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
