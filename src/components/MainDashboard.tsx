"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Wallet, TrendingUp, DollarSign, Users, Target, Award, Eye, Zap, Sparkles } from "lucide-react";
import { useWallet } from '@/contexts/WalletContext';
import FarmVerse3D from './FarmVerse3D';
import FieldDetailPage from './FieldDetailPage';
import VideoPlayer from './VideoPlayer';
import { InvestmentModal } from './InvestmentModal';
import { TestnetHelper } from './TestnetHelper';
import { TestnetBanner } from './TestnetBanner';

// ---- Type Definitions ----
type Field = {
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
  // DeFi additions
  investment_pool: {
    pool_id: number;
    total_staked: number;
    apy_estimate: number;
    min_stake: number;
    max_stake: number;
    investors_count: number;
    risk_level: 'Low' | 'Medium' | 'High';
    liquidity_locked_until: string;
    is_active: boolean;
    contract_deployed: boolean;
  };
  status: 'active' | 'available_soon';
  ai_yield_prediction: {
    estimated_yield_tons: number;
    confidence_score: number;
    weather_risk_factor: number;
    market_price_estimate: number;
  };
};

type FarmData = {
  message: string;
  timestamp: string;
  fields: Field[];
};

type ViewState = {
  page: 'dashboard' | 'field-detail' | 'portfolio' | 'staking';
  selectedField?: Field;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type UserPortfolio = {
  total_gui_balance: number;
  total_staked: number;
  total_rewards_earned: number;
  active_investments: number;
  portfolio_value_usd: number;
};

// ---- Main App Component ----
export default function Page() {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ page: 'dashboard' });
  const { isConnected: walletConnected, connect, disconnect, currentWallet, balance, address } = useWallet();
  const [walletType, setWalletType] = useState<'onechain' | 'sui' | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio>({
    total_gui_balance: 0,
    total_staked: 0,
    total_rewards_earned: 0,
    active_investments: 0,
    portfolio_value_usd: 0
  });
  
  // Detect wallet type and update balance
  useEffect(() => {
    if (currentWallet) {
      const walletName = currentWallet.name?.toLowerCase();
      if (walletName?.includes('onechain') || walletName?.includes('one chain')) {
        setWalletType('onechain');
      } else {
        setWalletType('sui');
      }
    } else {
      setWalletType(null);
    }
  }, [currentWallet]);
  
  // Update portfolio balance when wallet balance changes
  useEffect(() => {
    if (balance && walletConnected) {
      const balanceNum = parseFloat(balance) || 0;
      // Convert SUI balance to GUI tokens (using 1000 as conversion rate for demo)
      const guiBalance = balanceNum * 1000;
      
      setUserPortfolio(prev => ({
        ...prev,
        total_gui_balance: guiBalance,
        portfolio_value_usd: guiBalance * 1.85
      }));
      
      console.log('Wallet balance updated:', {
        suiBalance: balanceNum,
        guiBalance: guiBalance,
        address: address
      });
    }
  }, [balance, walletConnected, address]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedInvestmentField, setSelectedInvestmentField] = useState<Field | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real farm data from API
        const response = await fetch('/api/farming');
        if (!response.ok) {
          throw new Error('Failed to fetch farming data');
        }
        const enhancedFarmData = await response.json();
        
        setFarmData(enhancedFarmData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateToField = (field: Field) => {
    setViewState({ page: 'field-detail', selectedField: field });
  };

  const handleInvestmentClick = (field: Field) => {
    setSelectedInvestmentField(field);
    setShowInvestmentModal(true);
  };

  const handleInvestmentSuccess = () => {
    setShowInvestmentModal(false);
    // Could refresh data here if needed
    // For now, just close the modal
  };

  const navigateToPage = (page: 'dashboard' | 'portfolio' | 'staking') => {
    setViewState({ page });
  };

  const connectWallet = () => {
    connect();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-emerald-700 text-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          Loading GrowIQ DeFi Platform...
        </div>
      </div>
    );
  }

  if (error && !farmData) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-xl">
        <div className="text-center">
          <p className="mb-4">Error loading platform data: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render field detail page with investment options
  if (viewState.page === 'field-detail' && viewState.selectedField) {
    return (
      <FieldDetailPage 
        field={viewState.selectedField} 
        onBack={() => navigateToPage('dashboard')}
        walletConnected={walletConnected}
      />
    );
  }

  // Render portfolio page
  if (viewState.page === 'portfolio') {
    return (
      <PortfolioPage 
        portfolio={userPortfolio}
        onBack={() => navigateToPage('dashboard')}
        farmData={farmData}
        walletConnected={walletConnected}
      />
    );
  }

  // Render staking page
  if (viewState.page === 'staking') {
    return (
      <StakingPage 
        onBack={() => navigateToPage('dashboard')}
        farmData={farmData}
        walletConnected={walletConnected}
        userBalance={userPortfolio.total_gui_balance}
      />
    );
  }


  // Render main dashboard
  return (
    <>
      {/* Testnet Banner */}
      <TestnetBanner />
      
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 pt-16 pb-8 relative overflow-hidden">
      {/* Enhanced Header with DeFi Stats */}
      <header className="mx-auto max-w-7xl mb-8 px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-emerald-800 mb-2 drop-shadow-lg flex items-center gap-3">
              🌱 GrowIQ DeFi Platform
              <span className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg">Powered by $GUI</span>
            </h1>
            <p className="text-gray-800 text-lg font-medium">
              Real-Time Agri Investment | Live IoT Data |{" "}
              <span className="font-semibold text-emerald-700">
                {farmData?.timestamp ? new Date(farmData.timestamp).toLocaleString() : 'No timestamp'}
              </span>
            </p>
          </div>
          
          {/* Wallet & Navigation */}
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <nav className="flex gap-2">
              <button
                onClick={() => navigateToPage('dashboard')}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg border border-emerald-500"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateToPage('portfolio')}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg border border-blue-500"
              >
                Portfolio
              </button>
              <button
                onClick={() => navigateToPage('staking')}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg border border-purple-500"
              >
                Stake $GUI
              </button>
            </nav>
            
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <div className="bg-white/90 rounded-lg px-4 py-2 shadow-lg border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium">
                    Balance
                  </p>
                  <p className="font-bold text-emerald-800 text-lg">
                    {balance ? `${balance} SUI` : '0 SUI'}
                  </p>
                  <p className="text-xs text-gray-600">
                    ≈ {userPortfolio.total_gui_balance.toFixed(0)} GUI
                  </p>
                </div>
                {walletType === 'onechain' && (
                  <div className="bg-purple-600/20 rounded-lg px-3 py-1 shadow-lg border border-purple-400">
                    <p className="text-xs text-purple-800 font-bold">OneChain Network</p>
                  </div>
                )}
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg border border-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-purple-700 transition-colors shadow-lg border border-emerald-500"
              >
                <Wallet size={20} />
                Connect Wallet (OneChain/Sui)
              </button>
            )}
          </div>
        </div>

        {/* Simple DeFi Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-emerald-600" />
              <h3 className="font-semibold text-gray-700">Total Staked</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-800">
              {farmData?.fields.reduce((sum, f) => sum + f.investment_pool.total_staked, 0).toLocaleString()} $GUI
            </p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-700">Avg APY</h3>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              {farmData?.fields ? (farmData.fields.reduce((sum, f) => sum + f.investment_pool.apy_estimate, 0) / farmData.fields.length).toFixed(1) : 0}%
            </p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-700">Investors</h3>
            </div>
            <p className="text-2xl font-bold text-purple-800">
              {farmData?.fields.reduce((sum, f) => sum + f.investment_pool.investors_count, 0) || 0}
            </p>
          </div>
          
          <div className="bg-white/80 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-700">Active Pools</h3>
            </div>
            <p className="text-2xl font-bold text-orange-800">
              {farmData?.fields.length || 0}
            </p>
          </div>
        </div>
      </header>

      {/* Platform Demo Video */}
      <section className="max-w-7xl mx-auto px-6 mb-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/30 rounded-lg border border-purple-500/50">
                <Eye className="text-purple-700" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-900">Platform Demo</h2>
                <p className="text-sm text-purple-700 font-medium">See GrowIQ in Action</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-600/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-500/50">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-800">Demo Video</span>
            </div>
          </div>
          
          <div className="aspect-video">
            <VideoPlayer
              src="/GrowIQ_Video.mp4"
              title="GrowIQ DeFi Platform Demo"
              description="Discover how blockchain meets agriculture - Real-time monitoring, AI predictions, and DeFi investments"
              className="w-full h-full"
              controls={true}
              muted={true}
              autoPlay={false}
            />
          </div>
        </div>
      </section>

      {/* 3D Farm Visualization */}
      <section className="max-w-7xl mx-auto px-6 mb-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600/30 rounded-lg border border-emerald-500/50">
                <Eye className="text-emerald-700" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">FarmVerse 3D</h2>
                <p className="text-sm text-emerald-700 font-medium">Interactive Farm Visualization</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-600/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-500/50">
              <Sparkles className="text-emerald-700 animate-pulse" size={16} />
              <span className="text-sm font-semibold text-emerald-800">Live Data</span>
            </div>
          </div>
          
          <FarmVerse3D 
            farmData={farmData} 
            onFieldSelect={navigateToField}
          />
        </div>
      </section>


      {/* Enhanced Field Cards Grid */}
      <main className="max-w-7xl mx-auto px-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
        {farmData?.fields?.map((field) => (
          <EnhancedFieldCard key={field.field_id} field={field} onViewDetails={navigateToField} onInvestment={handleInvestmentClick} walletConnected={walletConnected} />
        )) || (
          <div className="col-span-full text-center text-gray-500">
            No investment pools available
          </div>
        )}
      </main>

      {/* AI Chatbot */}
      <AIChatbot farmData={farmData} />
      
      {/* Testnet Helper */}
      <TestnetHelper />

      
      {/* Investment Modal */}
      <InvestmentModal
        field={selectedInvestmentField || (farmData?.fields?.[0] as Field)}
        isOpen={showInvestmentModal}
        onClose={() => {
          console.log('Closing investment modal');
          setShowInvestmentModal(false);
          setSelectedInvestmentField(null);
        }}
        onSuccess={handleInvestmentSuccess}
      />
      </div>
    </>
  );
}

// ---- Enhanced Field Card Component with DeFi Features ----
function EnhancedFieldCard({ field, onViewDetails, onInvestment, walletConnected }: { field: Field; onViewDetails: (field: Field) => void; onInvestment: (field: Field) => void; walletConnected: boolean }) {
  // Color helpers
  function waterColor(val: number) {
    return val < 40
      ? "bg-red-400"
      : val < 60
      ? "bg-yellow-300"
      : "bg-emerald-400";
  }
  function tempColor(val: number) {
    if (val < 15) return "text-sky-700";
    if (val > 33) return "text-red-400";
    return "text-emerald-700";
  }
  function humidityColor(val: number) {
    return val > 80 ? "bg-blue-200" : "bg-emerald-200";
  }
  function riskColor(risk: string) {
    switch(risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const lowMoisture = field.soil_moisture_percent < 40;
  const expectedReturn = (field.ai_yield_prediction.estimated_yield_tons * field.ai_yield_prediction.market_price_estimate).toLocaleString();
  const isActive = field.status === 'active';
  const isAvailableSoon = field.status === 'available_soon';

  return (
    <section className={`relative backdrop-blur-lg shadow-xl rounded-xl p-6 border transition-all duration-200 flex flex-col gap-4 overflow-hidden group ${
      isActive 
        ? 'bg-white/80 border-emerald-100 hover:scale-[1.02] hover:shadow-emerald-300' 
        : 'bg-gray-50/80 border-gray-200 hover:scale-[1.01] hover:shadow-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-3xl">{getCropEmoji(field.crop_name)}</span>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-emerald-900">
            {field.crop_name}
          </h2>
          <div className="text-md text-gray-700">
            Field: <span className="font-semibold text-gray-800">{field.field_id}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isAvailableSoon && (
            <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow animate-bounce">
              Available Soon
            </span>
          )}
          {lowMoisture && isActive && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow animate-pulse">
              Low Moisture!
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isActive ? riskColor(field.investment_pool.risk_level) : 'bg-gray-200 text-gray-600'
          }`}>
            {isActive ? `${field.investment_pool.risk_level} Risk` : 'Pending Launch'}
          </span>
        </div>
      </div>

      {/* Investment Pool Stats */}
      <div className={`rounded-lg p-4 border ${
        isActive 
          ? 'bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200'
          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      }`}>
        {isActive ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-700 font-medium">APY Estimate</p>
              <p className="text-lg font-bold text-emerald-800">{field.investment_pool.apy_estimate}%</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Total Staked</p>
              <p className="text-lg font-bold text-blue-800">{field.investment_pool.total_staked.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Investors</p>
              <p className="text-lg font-bold text-purple-800">{field.investment_pool.investors_count}</p>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Min Stake</p>
              <p className="text-lg font-bold text-orange-800">{field.investment_pool.min_stake} $GUI</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-gray-600 font-medium">DeFi Pool Coming Soon</p>
            <p className="text-sm text-gray-500 mt-1">
              Expected APY: <span className="font-bold text-gray-700">{field.investment_pool.apy_estimate}%</span>
            </p>
            <p className="text-sm text-gray-500">
              Min Stake: <span className="font-bold text-gray-700">{field.investment_pool.min_stake} $GUI</span>
            </p>
          </div>
        )}
      </div>

      {/* AI Prediction */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-700">🤖</span>
          <span className="text-sm font-semibold text-purple-800">AI Yield Prediction</span>
          <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded font-medium">
            {field.ai_yield_prediction.confidence_score}% confidence
          </span>
        </div>
        <p className="text-sm text-gray-800">
          Est. Yield: <span className="font-bold text-gray-900">{field.ai_yield_prediction.estimated_yield_tons}t</span> | 
          Market Value: <span className="font-bold text-green-700">${expectedReturn}</span>
        </p>
      </div>

      {/* Growth Progress Bar */}
      <div>
        <label className="text-sm text-gray-800 font-semibold">
          Growth Progress
        </label>
        <div className="w-full bg-emerald-100 rounded-full h-4 overflow-hidden mt-1 border border-emerald-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${Math.min(field.growth_progress_percent, 100)}%` }}
          />
        </div>
        <p className="text-xs mt-1 text-gray-800 font-semibold font-mono">
          {field.growth_progress_percent}% ({field.days_since_planting} days)
        </p>
      </div>

      {/* Environmental Stats */}
      <dl className="grid grid-cols-2 gap-2 text-sm font-medium">
        <Stat
          label="Soil moisture"
          value={field.soil_moisture_percent + "%"}
          className={`${waterColor(field.soil_moisture_percent)} px-2 py-1 rounded text-center text-white`}
        />
        <Stat
          label="Temp"
          value={field.temperature_celsius + "°C"}
          className={tempColor(field.temperature_celsius)}
        />
        <Stat
          label="Humidity"
          value={field.humidity_percent + "%"}
          className={`${humidityColor(field.humidity_percent)} px-2 py-1 rounded text-center`}
        />
        <Stat
          label="Harvest"
          value={formatDate(field.expected_harvest_date)}
          className="text-emerald-600"
        />
      </dl>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewDetails(field);
          }}
          className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg border ${
            isActive 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
              : 'bg-gray-600 hover:bg-gray-700 text-white border-gray-500'
          }`}
          aria-label={`View details for ${field.crop_name} field ${field.field_id}`}
        >
          <Eye size={16} />
          <span>View Details</span>
        </button>
        {isActive ? (
          !walletConnected ? (
            <button 
              disabled
              className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed shadow-lg border border-gray-400"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInvestment(field);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg border border-blue-500 relative z-10"
            >
              <DollarSign size={16} />
              <span>Invest Now</span>
            </button>
          )
        ) : (
          <button
            disabled
            className="flex-1 bg-orange-400 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed shadow-lg border border-orange-300"
          >
            <Sparkles size={16} />
            <span>Coming Soon</span>
          </button>
        )}
      </div>
    </section>
  );
}


// ---- Portfolio Page ----
function PortfolioPage({ portfolio, onBack, farmData, walletConnected }: {
  portfolio: UserPortfolio;
  onBack: () => void;
  farmData: FarmData | null;
  walletConnected: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'rewards'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">My Portfolio</h1>
          <p className="text-gray-600">Track your $GUI investments and farming returns</p>
        </div>

        {!walletConnected ? (
          <div className="bg-white/80 rounded-xl p-12 shadow-xl text-center">
            <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-500 mb-6">Connect your wallet to view your portfolio</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-emerald-600" size={24} />
                  <span className="text-sm font-medium text-gray-600">Total Balance</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{portfolio.total_gui_balance.toLocaleString()} $GUI</p>
                <p className="text-sm text-gray-500">${(portfolio.total_gui_balance * 1.85).toLocaleString()} USD</p>
              </div>

              <div className="bg-white/80 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-blue-600" size={24} />
                  <span className="text-sm font-medium text-gray-600">Total Staked</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{portfolio.total_staked.toLocaleString()} $GUI</p>
                <p className="text-sm text-gray-500">${(portfolio.total_staked * 1.85).toLocaleString()} USD</p>
              </div>

              <div className="bg-white/80 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-purple-600" size={24} />
                  <span className="text-sm font-medium text-gray-600">Rewards Earned</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{portfolio.total_rewards_earned.toLocaleString()} $GUI</p>
                <p className="text-sm text-gray-500">+${(portfolio.total_rewards_earned * 1.85).toFixed(2)} USD</p>
              </div>

              <div className="bg-white/80 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-orange-600" size={24} />
                  <span className="text-sm font-medium text-gray-600">Portfolio Value</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">${portfolio.portfolio_value_usd.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12.5% this month</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
                {['overview', 'investments', 'rewards'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/80 rounded-xl p-8 shadow-xl">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Overview</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-4">Active Investments</h3>
                      <div className="space-y-3">
                        {farmData?.fields.slice(0, 3).map(field => (
                          <div key={field.field_id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getCropEmoji(field.crop_name)}</span>
                              <div>
                                <p className="font-medium">{field.crop_name}</p>
                                <p className="text-sm text-gray-600">Field {field.field_id}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-700">350 $GUI</p>
                              <p className="text-sm text-gray-600">{field.investment_pool.apy_estimate}% APY</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium">Staked in Wheat F1</p>
                            <p className="text-sm text-gray-600">2 days ago</p>
                          </div>
                          <p className="font-bold text-blue-700">+500 $GUI</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">Rewards Claimed</p>
                            <p className="text-sm text-gray-600">5 days ago</p>
                          </div>
                          <p className="font-bold text-green-700">+23.4 $GUI</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium">Staked in Rice F2</p>
                            <p className="text-sm text-gray-600">1 week ago</p>
                          </div>
                          <p className="font-bold text-purple-700">+300 $GUI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'investments' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Active Investments</h2>
                  <div className="space-y-4">
                    {farmData?.fields.slice(0, 5).map(field => (
                      <div key={field.field_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getCropEmoji(field.crop_name)}</span>
                            <div>
                              <h3 className="font-bold text-lg">{field.crop_name} - Field {field.field_id}</h3>
                              <p className="text-gray-600">Staked: 350 $GUI | APY: {field.investment_pool.apy_estimate}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Expected Returns</p>
                            <p className="font-bold text-green-600">+{(350 * field.investment_pool.apy_estimate / 100).toFixed(1)} $GUI</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Progress</p>
                            <p className="font-medium">{field.growth_progress_percent}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Days Left</p>
                            <p className="font-medium">{Math.ceil((new Date(field.expected_harvest_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Risk Level</p>
                            <p className={`font-medium ${
                              field.investment_pool.risk_level === 'Low' ? 'text-green-600' :
                              field.investment_pool.risk_level === 'Medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {field.investment_pool.risk_level}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'rewards' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Rewards History</h2>
                  <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-emerald-800">Claimable Rewards</h3>
                        <p className="text-emerald-600">Available to claim now</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-700">45.7 $GUI</p>
                        <button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                          Claim Rewards
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { date: '2025-07-25', amount: 23.4, source: 'Wheat F1', status: 'Claimed' },
                      { date: '2025-07-20', amount: 18.7, source: 'Rice F2', status: 'Claimed' },
                      { date: '2025-07-15', amount: 31.2, source: 'Cotton F6', status: 'Claimed' },
                      { date: '2025-07-10', amount: 15.8, source: 'Soybean F5', status: 'Claimed' },
                      { date: '2025-07-05', amount: 27.3, source: 'Maize F3', status: 'Claimed' },
                    ].map((reward, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{reward.source}</p>
                          <p className="text-sm text-gray-600">{formatDate(reward.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{reward.amount} $GUI</p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {reward.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Staking Page ----
function StakingPage({ onBack, farmData, walletConnected, userBalance }: {
  onBack: () => void;
  farmData: FarmData | null;
  walletConnected: boolean;
  userBalance: number;
}) {
  const [selectedPool, setSelectedPool] = useState<Field | null>(null);
  const [sortBy, setSortBy] = useState<'apy' | 'risk' | 'liquidity'>('apy');

  const sortedFields = farmData?.fields.sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.investment_pool.apy_estimate - a.investment_pool.apy_estimate;
      case 'risk':
        const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
        return riskOrder[a.investment_pool.risk_level] - riskOrder[b.investment_pool.risk_level];
      case 'liquidity':
        return a.investment_pool.total_staked - b.investment_pool.total_staked;
      default:
        return 0;
    }
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Stake $GUI Tokens</h1>
          <p className="text-gray-600">Choose from available farming pools to earn yields</p>
        </div>

        {!walletConnected ? (
          <div className="bg-white/80 rounded-xl p-12 shadow-xl text-center">
            <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-500 mb-6">Connect your wallet to start staking $GUI tokens</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* User Balance & Filters */}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="bg-white/80 rounded-lg px-4 py-3 shadow">
                <p className="text-sm text-gray-600">Your $GUI Balance</p>
                <p className="text-xl font-bold text-emerald-700">{userBalance.toLocaleString()} $GUI</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="apy">Highest APY</option>
                  <option value="risk">Lowest Risk</option>
                  <option value="liquidity">Highest Liquidity</option>
                </select>
              </div>
            </div>

            {/* Staking Pools Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedFields.map((field) => (
                <StakingPoolCard
                  key={field.field_id}
                  field={field}
                  onSelect={() => setSelectedPool(field)}
                  isSelected={selectedPool?.field_id === field.field_id}
                />
              ))}
            </div>

            {/* Selected Pool Details */}
            {selectedPool && (
              <div className="mt-8 bg-white/80 rounded-xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">
                  Stake in {selectedPool.crop_name} - Field {selectedPool.field_id}
                </h2>
                <StakingInterface field={selectedPool} userBalance={userBalance} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---- Staking Pool Card ----
function StakingPoolCard({ field, onSelect, isSelected }: {
  field: Field;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const riskColor = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
  };

  const lockPeriod = Math.ceil((new Date(field.investment_pool.liquidity_locked_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onClick={onSelect}
      className={`bg-white/80 rounded-xl p-6 shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-emerald-500 shadow-emerald-200' : 'hover:shadow-xl'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{getCropEmoji(field.crop_name)}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-emerald-900">{field.crop_name}</h3>
          <p className="text-gray-600">Field {field.field_id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColor[field.investment_pool.risk_level]}`}>
          {field.investment_pool.risk_level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <p className="text-sm text-emerald-600 font-medium">APY</p>
          <p className="text-xl font-bold text-emerald-700">{field.investment_pool.apy_estimate}%</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Min Stake</p>
          <p className="text-xl font-bold text-blue-700">{field.investment_pool.min_stake}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Staked:</span>
          <span className="font-medium">{field.investment_pool.total_staked.toLocaleString()} $GUI</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Investors:</span>
          <span className="font-medium">{field.investment_pool.investors_count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Lock Period:</span>
          <span className="font-medium">{lockPeriod} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Growth:</span>
          <span className="font-medium">{field.growth_progress_percent}%</span>
        </div>
      </div>

      <button
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isSelected
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Pool'}
      </button>
    </div>
  );
}

// ---- Staking Interface Component ----
function StakingInterface({ field, userBalance }: { field: Field; userBalance: number }) {
  const [stakeAmount, setStakeAmount] = useState(field.investment_pool.min_stake);
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async () => {
    if (stakeAmount < field.investment_pool.min_stake || stakeAmount > userBalance) return;
    
    setIsStaking(true);
    // Simulate staking transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsStaking(false);
    alert(`Successfully staked ${stakeAmount} $GUI tokens in ${field.crop_name} farm!`);
  };

  const expectedReturns = (stakeAmount * field.investment_pool.apy_estimate / 100).toFixed(2);
  const lockPeriod = Math.ceil((new Date(field.investment_pool.liquidity_locked_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Stake Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stake Amount ($GUI)
        </label>
        <div className="relative mb-4">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            min={field.investment_pool.min_stake}
            max={userBalance}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={`Min: ${field.investment_pool.min_stake} $GUI`}
          />
          <button
            onClick={() => setStakeAmount(userBalance)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            MAX
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          {[25, 50, 75, 100].map(percentage => (
            <button
              key={percentage}
              onClick={() => setStakeAmount(Math.floor(userBalance * percentage / 100))}
              className="flex-1 py-2 px-3 text-sm border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {percentage}%
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Your Balance: {userBalance.toLocaleString()} $GUI
        </p>

        <button
          onClick={handleStake}
          disabled={isStaking || stakeAmount < field.investment_pool.min_stake || stakeAmount > userBalance}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isStaking ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign size={20} />
              Stake {stakeAmount.toLocaleString()} $GUI
            </>
          )}
        </button>
      </div>

      {/* Staking Summary */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Staking Summary</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Stake Amount:</span>
                <span className="font-bold">{stakeAmount.toLocaleString()} $GUI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">APY:</span>
                <span className="font-bold text-emerald-600">{field.investment_pool.apy_estimate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Annual Returns:</span>
                <span className="font-bold text-green-600">{expectedReturns} $GUI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lock Period:</span>
                <span className="font-bold">{lockPeriod} days</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-emerald-200">
                <span className="text-gray-600">Unlock Date:</span>
                <span className="font-bold">{formatDate(field.investment_pool.liquidity_locked_until)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Farm Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Growth Progress:</span>
                <span className="font-medium">{field.growth_progress_percent}%</span>
              </div>
              <div className="flex justify-between">
                <span>AI Confidence:</span>
                <span className="font-medium">{field.ai_yield_prediction.confidence_score}%</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Yield:</span>
                <span className="font-medium">{field.ai_yield_prediction.estimated_yield_tons}t</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- AI Chatbot Component (Enhanced) ----
function AIChatbot({ farmData }: { farmData: FarmData | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your GrowIQ DeFi assistant. I can help you with crop analysis, investment strategies, staking recommendations, and analyzing your farming portfolio. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enhanced fallback response for DeFi features
      const fallbackResponse = getEnhancedFallbackResponse(inputMessage, farmData);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-50 hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-40">
          {/* Chat Header */}
          <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex items-center gap-2">
            <Bot size={20} />
            <h3 className="font-semibold">GrowIQ DeFi Assistant</h3>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-emerald-600" />
                  </div>
                )}
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-emerald-600" />
                </div>
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about investments, yields, or farming..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- Enhanced Fallback Response Function ----
function getEnhancedFallbackResponse(message: string, farmData: FarmData | null): string {
  const lowerMessage = message.toLowerCase();
  
  // Investment and staking queries
  if (lowerMessage.includes('invest') || lowerMessage.includes('stake') || lowerMessage.includes('apy')) {
    const bestAPY = farmData?.fields.reduce((max, field) => 
      field.investment_pool.apy_estimate > max ? field.investment_pool.apy_estimate : max, 0
    ) || 0;
    const bestCrop = farmData?.fields.find(f => f.investment_pool.apy_estimate === bestAPY);
    
    return `The highest APY currently available is ${bestAPY}% from ${bestCrop?.crop_name} (Field ${bestCrop?.field_id}). For diversification, consider spreading investments across different risk levels. Low-risk pools typically offer 10-13% APY, while high-risk pools can yield 15-20%.`;
  }
  
  // Portfolio and returns queries
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('return') || lowerMessage.includes('profit')) {
    return "Based on current farming pools, a diversified portfolio could include: 40% in low-risk crops (wheat, barley), 40% in medium-risk crops (rice, cotton), and 20% in high-risk, high-yield crops (maize). This typically provides 12-15% average APY with balanced risk exposure.";
  }
  
  // Risk and safety queries
  if (lowerMessage.includes('risk') || lowerMessage.includes('safe') || lowerMessage.includes('loss')) {
    const lowRiskPools = farmData?.fields.filter(f => f.investment_pool.risk_level === 'Low') || [];
    return `Low-risk farming pools include: ${lowRiskPools.map(f => `${f.crop_name} (${f.investment_pool.apy_estimate}% APY)`).join(', ')}. These crops have stable weather patterns, established markets, and high AI confidence scores (85%+). Your tokens are locked until harvest but protected by crop insurance.`;
  }
  
  // Market and timing queries
  if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('when')) {
    return "Market timing in agriculture depends on seasonal cycles. Current harvest seasons: Barley and Soybean (September), Maize and Tomato (October), Rice, Wheat, and Cotton (October-November). Early investments typically offer better APY rates before pools reach capacity.";
  }
  
  // Token and liquidity queries
  if (lowerMessage.includes('gui') || lowerMessage.includes('token') || lowerMessage.includes('withdraw')) {
    return "$GUI tokens are locked until harvest completion to ensure farm funding stability. Early withdrawal penalties apply, but you earn rewards proportional to actual crop yields. Rewards are claimable weekly, and all transactions are recorded on-chain for transparency.";
  }
  
  // Continue with existing agricultural queries...
  if (lowerMessage.includes('moisture') || lowerMessage.includes('water')) {
    const lowMoistureFields = farmData?.fields.filter(f => f.soil_moisture_percent < 40) || [];
    if (lowMoistureFields.length > 0) {
      return `I notice ${lowMoistureFields.length} field(s) have low soil moisture: ${lowMoistureFields.map(f => `${f.crop_name} (${f.field_id}): ${f.soil_moisture_percent}%`).join(', ')}. This could affect yields and investment returns. Consider checking irrigation systems.`;
    }
    return "Soil moisture levels look healthy across most pools. Good moisture management directly impacts crop yields and your investment returns.";
  }
  
  if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
    const hotFields = farmData?.fields.filter(f => f.temperature_celsius > 32) || [];
    if (hotFields.length > 0) {
      return `${hotFields.length} field(s) are experiencing high temperatures: ${hotFields.map(f => `${f.crop_name}: ${f.temperature_celsius}°C`).join(', ')}. Heat stress can reduce yields by 10-20%. Investments in these pools carry slightly higher weather risk.`;
    }
    return "Temperature levels are optimal for most crops, supporting projected yield estimates.";
  }
  
  if (lowerMessage.includes('harvest') || lowerMessage.includes('ready')) {
    const nearHarvest = farmData?.fields.filter(f => f.growth_progress_percent > 80) || [];
    if (nearHarvest.length > 0) {
      return `${nearHarvest.length} crop(s) nearing harvest: ${nearHarvest.map(f => `${f.crop_name} (${f.growth_progress_percent}%)`).join(', ')}. Harvest completion triggers reward distribution to stakers. Expected payout dates align with unlock schedules.`;
    }
    return "Most crops are in mid-growth stages. Returns will be distributed as harvests complete over the next 2-3 months.";
  }
  
  // Default enhanced response
  return "I can help you with investment strategies, yield analysis, risk assessment, and portfolio optimization for your $GUI farming investments. Ask me about specific crops, APY comparisons, or the best staking strategies for your goals!";
}

// ---- Helper Components and Functions ----
function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col items-start">
      <dt className="text-xs text-gray-700 uppercase tracking-wide font-medium">{label}</dt>
      <dd className={`font-bold text-gray-900 ${className || ''}`}>{value}</dd>
    </div>
  );
}

function formatDate(str: string) {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(str).toLocaleDateString(undefined, opts);
  } catch (error) {
    return str;
  }
}

function getCropEmoji(crop: string) {
  const em: { [k: string]: string } = {
    Wheat: "🌾",
    Rice: "🌱",
    Maize: "🌽",
    Barley: "🌾",
    Soybean: "🫘",
    Cotton: "🧵",
    Sugarcane: "🥃",
    Potato: "🥔",
    Tomato: "🍅",
    Onion: "🧅",
    Chilli: "🌶️",
    Peas: "🥗",
    Lentils: "🟤",
    Millet: "🍚",
    Groundnut: "🥜",
  };
  return em[crop] || "🌿";
}