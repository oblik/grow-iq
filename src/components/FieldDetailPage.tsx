import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, Clock, Droplets, Thermometer, Activity, Wallet } from 'lucide-react';
import { InvestmentModal } from './InvestmentModal';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { OneChainWalletButton } from './OneChainWalletButton';

// ---- Field Detail Page Component ----
interface FieldDetailPageProps {
  field: {
    field_id: string;
    crop_name: string;
    planting_date: string;
    expected_harvest_date: string;
    days_since_planting: number;
    growth_progress_percent: number;
    soil_moisture_percent: number;
    temperature_celsius: number;
    humidity_percent: number;
    timeline_instructions: string[];
    investment_pool: {
      pool_id?: number;
      total_staked: number;
      apy_estimate: number;
      min_stake: number;
      max_stake?: number;
      investors_count: number;
      risk_level: 'Low' | 'Medium' | 'High';
      liquidity_locked_until: string;
      is_active?: boolean;
    };
    ai_yield_prediction: {
      estimated_yield_tons: number;
      confidence_score: number;
      weather_risk_factor: number;
      market_price_estimate: number;
    };
  };
  onBack: () => void;
  walletConnected: boolean;
}

function FieldDetailPage({ field, onBack, walletConnected }: FieldDetailPageProps) {
  const [stakeAmount, setStakeAmount] = useState(field.investment_pool.min_stake);
  const [isStaking, setIsStaking] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const currentAccount = useCurrentAccount();
  
  const handleStake = async () => {
    setShowInvestmentModal(true);
  };
  
  const handleInvestmentSuccess = () => {
    setShowInvestmentModal(false);
    // Refresh data or show success notification
  };

  // Helper functions
  const getCropEmoji = (crop: string) => {
    const emojiMap: { [key: string]: string } = {
      'Wheat': '🌾',
      'Rice': '🌾',
      'Corn': '🌽',
      'Tomatoes': '🍅',
      'Carrots': '🥕',
      'Lettuce': '🥬',
      'default': '🌱'
    };
    return emojiMap[crop] || emojiMap.default;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const waterColor = (val: number) => {
    if (val < 40) return "bg-red-500";
    if (val < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const tempColor = (val: number) => {
    if (val < 15) return "text-blue-600 dark:text-blue-400";
    if (val > 33) return "text-red-600 dark:text-red-400";
    return "text-green-600 dark:text-green-400";
  };

  const lowMoisture = field.soil_moisture_percent < 40;
  const daysToHarvest = Math.ceil((new Date(field.expected_harvest_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const expectedReturns = (stakeAmount * field.investment_pool.apy_estimate / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      {/* Header with Back Button */}
      <header className="mx-auto max-w-6xl mb-8 px-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{getCropEmoji(field.crop_name)}</span>
          <div>
            <h1 className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              {field.crop_name} Field
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Field ID: <span className="font-semibold">{field.field_id}</span>
            </p>
            {lowMoisture && (
              <div className="mt-2 inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                <span>⚠️</span>
                <span>Low Moisture Alert!</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Field Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Growth Progress Section */}
            <section className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <Activity size={24} />
                Growth Progress
              </h2>
              <div className="mb-4">
                <div className="w-full bg-emerald-100 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-emerald-500 to-emerald-600 transition-all flex items-center justify-end pr-4"
                    style={{ width: `${Math.min(field.growth_progress_percent, 100)}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      {field.growth_progress_percent}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{field.days_since_planting}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days Since Planting</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{daysToHarvest}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days to Harvest</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{formatDate(field.expected_harvest_date)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expected Harvest</p>
                </div>
              </div>
            </section>

            {/* Environmental Conditions */}
            <section className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <Thermometer size={24} />
                Environmental Conditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`mx-auto w-24 h-24 rounded-full ${waterColor(field.soil_moisture_percent)} flex items-center justify-center text-white font-bold text-xl mb-2`}>
                    <Droplets className="mr-1" size={16} />
                    {field.soil_moisture_percent}%
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Soil Moisture</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {field.soil_moisture_percent < 40 ? 'Low - Needs irrigation' : 
                     field.soil_moisture_percent < 60 ? 'Moderate - Monitor closely' : 
                     'Good - Adequate moisture'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                    <Thermometer className="mr-1" size={16} />
                    {field.temperature_celsius}°C
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Temperature</h3>
                  <p className={`text-sm mt-1 font-medium ${tempColor(field.temperature_celsius)}`}>
                    {field.temperature_celsius < 15 ? 'Cool' : 
                     field.temperature_celsius > 33 ? 'Hot' : 
                     'Optimal'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-2">
                    💧 {field.humidity_percent}%
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Humidity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {field.humidity_percent > 80 ? 'High humidity' : 'Normal levels'}
                  </p>
                </div>
              </div>
            </section>

            {/* AI Predictions */}
            <section className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <Target size={24} />
                AI Yield Predictions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{field.ai_yield_prediction.estimated_yield_tons} tons</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Yield</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{field.ai_yield_prediction.confidence_score}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI Confidence</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">${field.ai_yield_prediction.market_price_estimate}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market Price/Ton</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{(field.ai_yield_prediction.weather_risk_factor * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weather Risk</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Investment Panel */}
          <div className="space-y-6">
            <section className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <DollarSign size={24} />
                Investment Pool
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(field.investment_pool.risk_level)}`}>
                    {field.investment_pool.risk_level}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">APY</span>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{field.investment_pool.apy_estimate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Staked</span>
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{field.investment_pool.total_staked.toLocaleString()} $GUI</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Investors</span>
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-400">{field.investment_pool.investors_count}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Min Stake</span>
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{field.investment_pool.min_stake} $GUI</span>
                </div>
              </div>

              {/* Investment Form */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stake Amount ($GUI)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  min={field.investment_pool.min_stake}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder={`Min: ${field.investment_pool.min_stake} $GUI`}
                />
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected Returns (Annual):</span>
                    <span className="font-bold text-green-600 dark:text-green-400">${expectedReturns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lock Period:</span>
                    <span className="font-bold">Until harvest</span>
                  </div>
                </div>

                {!currentAccount ? (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <Wallet size={16} />
                        <span className="text-sm font-medium">Connect your OneChain wallet to invest</span>
                      </div>
                    </div>
                    <OneChainWalletButton />
                  </div>
                ) : (
                  <button
                    onClick={handleStake}
                    disabled={isStaking || stakeAmount < field.investment_pool.min_stake}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isStaking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign size={16} />
                        Invest {stakeAmount} GUI
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>

            {/* Timeline */}
            <section className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Timeline Instructions
              </h2>
              <div className="space-y-3">
                {field.timeline_instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{instruction}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Investment Modal */}
      <InvestmentModal
        field={{
          ...field,
          investment_pool: {
            ...field.investment_pool,
            pool_id: field.investment_pool.pool_id || Math.floor(Math.random() * 1000),
            max_stake: field.investment_pool.max_stake || 10000,
            is_active: field.investment_pool.is_active !== false
          }
        }}
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        onSuccess={handleInvestmentSuccess}
      />
    </div>
  );
}

export default FieldDetailPage;