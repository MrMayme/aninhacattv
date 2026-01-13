import RankingHeader from '@/app/components/RankingHeader';
import RankingContent from '@/app/components/RankingContent';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-purple-100">
      <RankingHeader />
      <RankingContent />
      <Footer />
    </div>
  );
}
