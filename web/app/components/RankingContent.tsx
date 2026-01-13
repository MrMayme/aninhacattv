'use client';

import { useState, useEffect } from 'react';
import RankingCard from './RankingCard';
import RankingList from './RankingList';
import TabButtons from './TabButtons';
import { RankingUser, TimePeriod, RankingData } from '@/app/types/ranking';
import { fetchRanking } from '@/app/lib/api';

export default function RankingContent() {
  const [data, setData] = useState<RankingData>({
    mensal: [],
    anual: [],
    all: [],
  });
  const [activeTab, setActiveTab] = useState<TimePeriod>('mensal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        setError(null);
        const rankingData = await fetchRanking();
        setData(rankingData);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar ranking');
        // Usar dados de exemplo em caso de erro
        setData({
          mensal: [
          ],
          anual: [
          ],
          all: [
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const currentRanking = data[activeTab] || [];
  const top3 = currentRanking.slice(0, 3);
  const remaining = currentRanking.slice(3);

  return (
    <>
      <TabButtons activeTab={activeTab} onTabChange={setActiveTab} />

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

        {!loading && top3.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {top3.map((user, index) => (
              <RankingCard
                key={`${user.nick}-${index}`}
                user={user}
                position={index as 0 | 1 | 2}
              />
            ))}
          </section>
        )}

        {!loading && remaining.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mais Rankings</h2>
            <RankingList users={remaining} />
          </section>
        )}

        {!loading && currentRanking.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum dado de ranking disponível</p>
          </div>
        )}
      </main>
    </>
  );
}
