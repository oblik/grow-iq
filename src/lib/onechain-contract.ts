import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// OneChain Testnet Configuration
export const ONECHAIN_TESTNET_RPC = 'https://rpc-testnet.onelabs.cc:443';

// Contract addresses (to be updated after deployment)
export const CONTRACT_CONFIG = {
  packageId: '0x...', // Update with actual package ID after deployment
  farmingPoolModule: 'farming_pool',
  adminCapId: '0x...', // Update with actual AdminCap object ID
};

// Initialize OneChain client
export function getOneChainClient() {
  return new SuiClient({ url: ONECHAIN_TESTNET_RPC });
}

// Create a new farming pool
export async function createFarmingPool(
  adminCap: string,
  name: string,
  cropType: string,
  apy: number,
  minStake: number,
  lockPeriod: number,
  signer: Ed25519Keypair
) {
  const client = getOneChainClient();
  const tx = new Transaction();

  // Get current timestamp
  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.farmingPoolModule}::create_pool`,
    arguments: [
      tx.object(adminCap),
      tx.pure.string(name),
      tx.pure.string(cropType),
      tx.pure.u64(apy),
      tx.pure.u64(minStake),
      tx.pure.u64(lockPeriod),
      tx.object('0x6'), // Clock object ID
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
  });

  return result;
}

// Stake OCT tokens in a farming pool
export async function stakeInPool(
  poolId: string,
  amount: number,
  coinObjectId: string,
  signer: Ed25519Keypair
) {
  const client = getOneChainClient();
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.farmingPoolModule}::stake`,
    arguments: [
      tx.object(poolId),
      tx.object(coinObjectId),
      tx.object('0x6'), // Clock object ID
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
  });

  return result;
}

// Calculate rewards for a staker
export async function calculateRewards(
  poolId: string,
  stakerAddress: string
) {
  const client = getOneChainClient();
  
  // This would be a view function call
  const result = await client.devInspectTransactionBlock({
    transactionBlock: {
      inputs: [
        { type: 'object', objectId: poolId },
        { type: 'pure', value: stakerAddress },
        { type: 'object', objectId: '0x6' }, // Clock
      ],
      transactions: [
        {
          MoveCall: {
            target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.farmingPoolModule}::calculate_rewards`,
            arguments: [0, 1, 2],
          },
        },
      ],
    },
    sender: stakerAddress,
  });

  return result;
}

// Harvest rewards without withdrawing stake
export async function harvestRewards(
  poolId: string,
  signer: Ed25519Keypair
) {
  const client = getOneChainClient();
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.farmingPoolModule}::harvest_rewards`,
    arguments: [
      tx.object(poolId),
      tx.object('0x6'), // Clock object ID
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
  });

  return result;
}

// Withdraw stake and rewards
export async function withdrawFromPool(
  poolId: string,
  signer: Ed25519Keypair
) {
  const client = getOneChainClient();
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.farmingPoolModule}::withdraw`,
    arguments: [
      tx.object(poolId),
      tx.object('0x6'), // Clock object ID
    ],
  });

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
  });

  return result;
}

// Get pool information
export async function getPoolInfo(poolId: string) {
  const client = getOneChainClient();
  
  try {
    const object = await client.getObject({
      id: poolId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (object.data && 'content' in object.data) {
      return object.data.content;
    }
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return null;
  }
}

// Get all pools (would require an indexer in production)
export async function getAllPools() {
  const client = getOneChainClient();
  
  // In production, you would use an indexer or events to track all pools
  // For demo purposes, returning mock data
  return [
    {
      id: '0x123...',
      name: 'Wheat Farm Pool',
      cropType: 'Wheat',
      apy: 1200, // 12%
      totalStaked: 1000000,
      isActive: true,
    },
    {
      id: '0x456...',
      name: 'Rice Cultivation Pool',
      cropType: 'Rice',
      apy: 1500, // 15%
      totalStaked: 2000000,
      isActive: true,
    },
  ];
}

// Export types for TypeScript
export interface FarmingPool {
  id: string;
  name: string;
  cropType: string;
  totalStaked: number;
  apy: number;
  minStake: number;
  lockPeriod: number;
  isActive: boolean;
}

export interface StakeInfo {
  amount: number;
  stakedAt: number;
  lastHarvest: number;
  rewardsEarned: number;
}