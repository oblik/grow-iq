import MainDashboard from '@/components/MainDashboard';
import { Header } from '@/components/Header';
import { TransactionComponent } from '@/components/TransactionComponent';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MainDashboard />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <TransactionComponent />
          </div>
        </div>
      </div>
    </div>
  );
}