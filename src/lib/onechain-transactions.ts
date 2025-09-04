import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ONECHAIN_CONFIG, getRpcUrl } from '@/config/onechain';

// OneChain transaction utilities
export class OneChainTransactionBuilder {
  private client: SuiClient;
  
  constructor() {
    this.client = new SuiClient({ url: getRpcUrl() });
  }

  // Create a simple transfer transaction
  createTransfer(recipient: string, amount: number): Transaction {
    const tx = new Transaction();
    
    // Convert amount to MIST (smallest unit)
    const amountInMist = Math.floor(amount * 1e9);
    
    // Split coins from gas for transfer
    const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
    
    // Transfer to recipient
    tx.transferObjects([coin], tx.pure.address(recipient));
    
    return tx;
  }

  // Create farming pool stake transaction
  createStakeTransaction(poolId: string, amount: number): Transaction {
    const tx = new Transaction();
    
    // Convert GUI/OCT amount to smallest unit
    const amountInMist = Math.floor(amount * 1e9);
    
    // Split coins for staking
    const [stakeCoin] = tx.splitCoins(tx.gas, [amountInMist]);
    
    // Stake in farming pool
    // This is a placeholder - actual contract address will be deployed
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.contracts.farming.packageId}::farming_pool::stake`,
      arguments: [
        tx.object(poolId),
        stakeCoin,
        tx.object('0x6'), // Clock object
      ],
    });
    
    return tx;
  }

  // Create withdrawal transaction
  createWithdrawTransaction(poolId: string, shares: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.contracts.farming.packageId}::farming_pool::withdraw`,
      arguments: [
        tx.object(poolId),
        tx.object(shares), // User's share tokens
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Create harvest rewards transaction
  createHarvestTransaction(poolId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${ONECHAIN_CONFIG.contracts.farming.packageId}::farming_pool::harvest`,
      arguments: [
        tx.object(poolId),
        tx.object('0x6'), // Clock
      ],
    });
    
    return tx;
  }

  // Execute transaction with wallet
  async executeTransaction(
    tx: Transaction,
    keypair?: Ed25519Keypair
  ): Promise<{
    digest: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // If keypair provided, sign and execute
      if (keypair) {
        const result = await this.client.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
          },
        });
        
        return {
          digest: result.digest,
          success: result.effects?.status?.status === 'success',
        };
      }
      
      // Otherwise, prepare for wallet signing
      // This will be handled by the wallet provider
      return {
        digest: '',
        success: false,
        error: 'Wallet signing required',
      };
    } catch (error) {
      console.error('Transaction execution failed:', error);
      return {
        digest: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }

  // Get transaction status
  async getTransactionStatus(digest: string): Promise<{
    status: 'success' | 'failure' | 'pending';
    gasUsed?: string;
    timestamp?: number;
  }> {
    try {
      const txn = await this.client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
      
      return {
        status: txn.effects?.status?.status === 'success' ? 'success' : 'failure',
        gasUsed: txn.effects?.gasUsed?.computationCost,
        timestamp: Number(txn.timestampMs || 0),
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return { status: 'pending' };
    }
  }

  // Get user's staked balance in a pool
  async getStakedBalance(poolId: string, userAddress: string): Promise<number> {
    try {
      // Query user's stake in the pool
      // This would query the actual contract state
      const pool = await this.client.getObject({
        id: poolId,
        options: {
          showContent: true,
        },
      });
      
      // Parse pool data to get user's stake
      // This is placeholder logic
      return 0;
    } catch (error) {
      console.error('Failed to get staked balance:', error);
      return 0;
    }
  }

  // Estimate gas for transaction
  async estimateGas(tx: Transaction): Promise<string> {
    try {
      // OneChain uses similar gas estimation as Sui
      // Default to 0.1 OCT for most transactions
      return '100000000'; // 0.1 OCT in MIST
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return '100000000';
    }
  }
}

// Export singleton instance
export const onechainTxBuilder = new OneChainTransactionBuilder();

// Helper functions for transaction formatting
export function formatOneChainAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function formatOneChainAmount(amount: number, decimals = 9): string {
  const formatted = (amount / Math.pow(10, decimals)).toFixed(4);
  return `${formatted} ${ONECHAIN_CONFIG.tokens.native.symbol}`;
}

export function getOneChainExplorerLink(digest: string): string {
  const network = process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
  const baseUrl = ONECHAIN_CONFIG.networks[network].explorer;
  return `${baseUrl}/tx/${digest}?network=${network}`;
}