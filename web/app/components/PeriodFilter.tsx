'use client';

import { useState, useRef, useEffect } from 'react';
import { TimePeriod } from '@/app/types/ranking';

interface PeriodFilterProps {
  activeTab: TimePeriod;
  onTabChange: (tab: TimePeriod) => void;
}

export default function PeriodFilter({ activeTab, onTabChange }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const periods: { label: string; value: TimePeriod }[] = [
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' },
    { label: 'Todos os tempos', value: 'all' },
  ];

  const activeLabel = periods.find((p) => p.value === activeTab)?.label;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fechar ao selecionar
  const handleSelect = (value: TimePeriod) => {
    onTabChange(value);
    setIsOpen(false);
  };

  return (
    <div className="flex justify-center mb-6 sm:mb-8 px-4 sm:px-6">
      <div className="relative inline-block w-full max-w-xs sm:max-w-sm md:max-w-md" ref={dropdownRef}>
        {/* Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-lg font-medium text-sm sm:text-base
            transition-all duration-200
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
            ${
              isOpen
                ? 'bg-purple-50 text-purple-700 border border-purple-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
            }
          `}
          aria-expanded={isOpen}
          aria-label="Filtrar por período"
        >
          <span className="flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-lg">📅</span>
            <span className="text-sm sm:text-base">{activeLabel}</span>
          </span>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => handleSelect(period.value)}
                className={`
                  w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-left
                  transition-colors duration-150
                  flex items-center gap-2 sm:gap-3
                  ${
                    activeTab === period.value
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                  ${period.value !== 'all' ? 'border-b border-gray-100' : ''}
                `}
                role="option"
                aria-selected={activeTab === period.value}
              >
                {activeTab === period.value && <span className="text-purple-500">✓</span>}
                {period.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
