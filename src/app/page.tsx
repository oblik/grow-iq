import MainDashboard from '@/components/MainDashboard';
import { Header } from '@/components/Header';
import { TransactionComponent } from '@/components/TransactionComponent';

export default function Home() {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainDashboard />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <TransactionComponent />
          </div>
        </div>
      </div>
    </div>
  );
}