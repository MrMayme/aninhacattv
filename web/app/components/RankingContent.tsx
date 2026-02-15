'use client';

import { useState, useEffect } from 'react';
import RankingCard from './RankingCard';
import RankingList from './RankingList';
import RankingTypeButtons from './RankingTypeButtons';
import PeriodFilter from './PeriodFilter';
import { RankingUser, TimePeriod, RankingData, RankingType } from '@/app/types/ranking';
import { fetchInitialRanking, fetchRankingData } from '@/app/lib/api';

export default function RankingContent() {
  const [data, setData] = useState<RankingData>({
    hours: { mensal: [], anual: [], all: [] },
    messages: { mensal: [], anual: [], all: [] },
    total: { mensal: [], anual: [], all: [] },
  });
  const [activeTab, setActiveTab] = useState<TimePeriod>('mensal');
  const [activeType, setActiveType] = useState<RankingType>('total');
  const [loading, setLoading] = useState(true);
  const [loadingLazy, setLoadingLazy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCombinations, setLoadedCombinations] = useState<Set<string>>(new Set(['total:mensal']));

  // Carregamento inicial - apenas 'total' + 'mensal'
  useEffect(() => {
    const loadInitialRanking = async () => {
      try {
        setLoading(true);
        setError(null);
        const initialData = await fetchInitialRanking();
        setData((prevData) => ({
          ...prevData,
          total: { ...prevData.total, mensal: initialData },
        }));
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar ranking');
      } finally {
        setLoading(false);
      }
    };

    loadInitialRanking();
  }, []);

  // Lazy loading - carrega dados quando o usuário muda de aba/tipo
  useEffect(() => {
    const combinationKey = `${activeType}:${activeTab}`;
    
    // Se já foi carregado, não faz nada
    if (loadedCombinations.has(combinationKey)) {
      return;
    }

    const loadRankingData = async () => {
      try {
        setLoadingLazy(true);
        setError(null);
        const rankingUsers = await fetchRankingData(activeType, activeTab);
        
        setData((prevData) => ({
          ...prevData,
          [activeType]: {
            ...prevData[activeType],
            [activeTab]: rankingUsers,
          },
        }));
        
        // Marca essa combinação como carregada
        setLoadedCombinations((prev) => new Set(prev).add(combinationKey));
      } catch (err) {
        console.error(err);
        setError(`Erro ao carregar ranking de ${activeType}`);
      } finally {
        setLoadingLazy(false);
      }
    };

    loadRankingData();
  }, [activeType, activeTab, loadedCombinations]);

  const currentRanking = data[activeType][activeTab] || [];
  const top3 = currentRanking.slice(0, 3);
  const remaining = currentRanking.slice(3);

  return (
    <>
      {/* Tabs principais - Tipo de Ranking (Horas, Mensagens, Total) */}
      <RankingTypeButtons activeType={activeType} onTypeChange={setActiveType} />

      {/* Filtro secundário - Período (Mensal, Anual, Todos os tempos) */}
      <PeriodFilter activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-5xl mx-auto px-6 pb-16">
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando ranking...</p>
          </div>
        )}

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {loadingLazy && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Carregando dados...</p>
              </div>
            )}

            {top3.length > 0 && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {top3.map((user, index) => (
                  <RankingCard
                    key={`${activeTab}-${activeType}-${user.nick}-${index}`}
                    user={user}
                    position={index as 0 | 1 | 2}
                    type={activeType}
                  />
                ))}
              </section>
            )}

            {remaining.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mais Rankings</h2>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  <RankingList users={remaining} type={activeType} activeTab={activeTab} />
                </div>
              </section>
            )}

            {currentRanking.length === 0 && !loadingLazy && (
              <div className="text-center py-12">
                <p className="text-gray-600">Nenhum dado de ranking disponível</p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}