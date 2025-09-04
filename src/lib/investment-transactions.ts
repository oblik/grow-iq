import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { getRpcUrl, getExplorerUrl as getOneChainExplorerUrl, isOneChainWallet } from '@/config/onechain';

// Legacy RPC endpoints (kept for backward compatibility)
const SUI_TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';

// Contract configuration (to be updated after deployment)
export const FARMING_CONTRACT = {
  packageId: '0x123...', // Update after deployment
  module: 'farming_pool',
  adminCap: '0xabc...', // Update after deployment
};

// Initialize client
export function getInvestmentClient() {
  // Use the centralized RPC configuration
  const rpcUrl = getRpcUrl();
  return new SuiClient({ url: rpcUrl });
}

// Investment transaction types
export interface InvestmentRequest {
  poolId: string;
  amount: number; // in GUI/OCT tokens
  fieldId: string;
  cropType: string;
  expectedAPY: number;
}

export interface InvestmentResult {
  success: boolean;
  transactionDigest?: string;
  error?: string;
  timestamp?: number;
  gasUsed?: string;
}

// Create investment transaction
export function createInvestmentTransaction(request: InvestmentRequest): Transaction {
  const tx = new Transaction();
  
  // Convert amount to smallest unit (MIST)
  const amountInMist = request.amount * 1e9;
  
  // Split coins for investment
  const [investmentCoin] = tx.splitCoins(tx.gas, [amountInMist]);
  
  // Call the stake function in our farming pool contract
  tx.moveCall({
    target: `${FARMING_CONTRACT.packageId}::${FARMING_CONTRACT.module}::stake`,
    arguments: [
      tx.object(request.poolId),  // Pool to invest in
      investmentCoin,              // Investment amount
      tx.object('0x6'),           // System clock
    ],
  });

  // Set transaction metadata
  tx.setSender('0xSENDER'); // Will be replaced by wallet
  tx.setGasBudget(100000000); // 0.1 SUI for gas
  
  return tx;
}

// Function for making investments from UI
export function createInvestmentHandler(currentAccount: any) {
  const client = getInvestmentClient();
  
  const makeInvestment = async (request: InvestmentRequest): Promise<InvestmentResult> => {
    if (!currentAccount) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your OneChain wallet.',
      };
    }

    try {
      const tx = createInvestmentTransaction(request);
      
      // For demo purposes, simulating transaction execution
      // In production, this would use signAndExecuteTransaction
      console.log('Investment Transaction Created:', {
        pool: request.poolId,
        amount: `${request.amount} GUI/OCT`,
        field: request.fieldId,
        crop: request.cropType,
        expectedAPY: `${request.expectedAPY}%`,
      });

      // Simulate successful transaction
      const mockDigest = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      return {
        success: true,
        transactionDigest: mockDigest,
        timestamp: Date.now(),
        gasUsed: '0.001',
      };
    } catch (error) {
      console.error('Investment transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  };

  const checkInvestmentStatus = async (poolId: string): Promise<any> => {
    try {
      const poolInfo = await client.getObject({
        id: poolId,
        options: {
          showContent: true,
          showType: true,
        },
      });
      
      return poolInfo;
    } catch (error) {
      console.error('Failed to fetch investment status:', error);
      return null;
    }
  };

  const withdrawInvestment = async (poolId: string): Promise<InvestmentResult> => {
    if (!currentAccount) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${FARMING_CONTRACT.packageId}::${FARMING_CONTRACT.module}::withdraw`,
        arguments: [
          tx.object(poolId),
          tx.object('0x6'), // Clock
        ],
      });

      // Simulate withdrawal
      console.log('Withdrawal transaction created for pool:', poolId);
      
      return {
        success: true,
        transactionDigest: `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Withdrawal failed',
      };
    }
  };

  const harvestRewards = async (poolId: string): Promise<InvestmentResult> => {
    if (!currentAccount) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${FARMING_CONTRACT.packageId}::${FARMING_CONTRACT.module}::harvest_rewards`,
        arguments: [
          tx.object(poolId),
          tx.object('0x6'), // Clock
        ],
      });

      // Simulate harvest
      console.log('Harvest transaction created for pool:', poolId);
      
      return {
        success: true,
        transactionDigest: `HRV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Harvest failed',
      };
    }
  };

  return {
    makeInvestment,
    checkInvestmentStatus,
    withdrawInvestment,
    harvestRewards,
  };
}

// Calculate investment returns
export function calculateReturns(
  principal: number,
  apy: number,
  daysInvested: number
): number {
  const dailyRate = apy / 365 / 100;
  const returns = principal * dailyRate * daysInvested;
  return Math.round(returns * 100) / 100; // Round to 2 decimals
}

// Format transaction for display
export function formatTransaction(digest: string): string {
  if (!digest) return '';
  if (digest.length <= 12) return digest;
  return `${digest.slice(0, 6)}...${digest.slice(-4)}`;
}

// Get explorer URL for transaction
export function getExplorerUrl(digest: string, network = 'testnet'): string {
  // Check if we're on OneChain network
  const isOneChain = typeof window !== 'undefined' && 
    window.localStorage?.getItem('wallet_network') === 'onechain';
  
  // For mock transactions, indicate they're demo transactions
  if (digest.startsWith('INV_') || digest.startsWith('WD_') || digest.startsWith('HRV_') || 
      digest.startsWith('OCT_') || digest.startsWith('SUI_')) {
    // These are demo transactions
    if (isOneChain) {
      return getOneChainExplorerUrl(digest);
    }
    return `https://suiscan.xyz/${network}/tx/${digest}`;
  }
  
  // For real transactions
  if (isOneChain) {
    return getOneChainExplorerUrl(digest);
  }
  return `https://suiscan.xyz/${network}/tx/${digest}`;
}