'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Sprout, TrendingUp, Clock, Coins, Lock, CheckCircle } from 'lucide-react'
import { 
  stakeInPool, 
  harvestRewards, 
  withdrawFromPool, 
  getPoolInfo,
  getAllPools,
  FarmingPool
} from '@/lib/onechain-contract'

export function OneChainFarmingPool() {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [pools, setPools] = useState<FarmingPool[]>([])
  const [selectedPool, setSelectedPool] = useState<FarmingPool | null>(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txResult, setTxResult] = useState<any>(null)

  useEffect(() => {
    // Load available pools
    loadPools()
  }, [])

  const loadPools = async () => {
    const poolsData = await getAllPools()
    setPools(poolsData as FarmingPool[])
  }

  const handleStake = async () => {
    if (!currentAccount || !selectedPool || !stakeAmount) {
      alert('Please connect wallet, select a pool, and enter amount')
      return
    }

    setLoading(true)
    try {
      const tx = new Transaction()
      
      // Split coins for staking
      const [coin] = tx.splitCoins(tx.gas, [Number(stakeAmount) * 1e9]) // Convert to MIST
      
      tx.moveCall({
        target: `0x...::farming_pool::stake`, // Update with actual package ID
        arguments: [
          tx.object(selectedPool.id),
          coin,
          tx.object('0x6'), // Clock
        ],
      })

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Staking successful:', result)
            setTxResult(result)
            setLoading(false)
            setStakeAmount('')
          },
          onError: (error) => {
            console.error('Staking failed:', error)
            setLoading(false)
          },
        }
      )
    } catch (error) {
      console.error('Error creating transaction:', error)
      setLoading(false)
    }
  }

  const handleHarvest = async (poolId: string) => {
    if (!currentAccount) {
      alert('Please connect wallet')
      return
    }

    setLoading(true)
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `0x...::farming_pool::harvest_rewards`, // Update with actual package ID
        arguments: [
          tx.object(poolId),
          tx.object('0x6'), // Clock
        ],
      })

      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Harvest successful:', result)
            setTxResult(result)
            setLoading(false)
          },
          onError: (error) => {
            console.error('Harvest failed:', error)
            setLoading(false)
          },
        }
      )
    } catch (error) {
      console.error('Error harvesting:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">OneChain Farming Pools</h2>
        <p className="text-white/90">
          Stake OCT tokens in farming pools and earn rewards based on real agricultural yields
        </p>
      </div>

      {/* Pool Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedPool?.id === pool.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setSelectedPool(pool)}
          >
            <div className="flex items-center justify-between mb-3">
              <Sprout className="w-8 h-8 text-green-500" />
              {selectedPool?.id === pool.id && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{pool.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Crop Type: {pool.cropType}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  APY
                </span>
                <span className="font-bold text-green-600">
                  {(pool.apy / 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  Total Staked
                </span>
                <span className="font-medium">
                  {(pool.totalStaked / 1e9).toFixed(2)} OCT
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Lock Period
                </span>
                <span className="font-medium">
                  {pool.lockPeriod / 86400} days
                </span>
              </div>
            </div>
            
            {pool.isActive ? (
              <span className="inline-block mt-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            ) : (
              <span className="inline-block mt-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Inactive
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Staking Interface */}
      {selectedPool && currentAccount && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            Stake in {selectedPool.name}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stake Amount (OCT)
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to stake"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                min={selectedPool.minStake / 1e9}
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: {(selectedPool.minStake / 1e9).toFixed(2)} OCT
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Processing...' : 'Stake OCT'}
              </button>
              
              <button
                onClick={() => handleHarvest(selectedPool.id)}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Harvest Rewards
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estimated Daily Rewards: {
                stakeAmount ? 
                ((Number(stakeAmount) * selectedPool.apy) / 36500).toFixed(4) : 
                '0.0000'
              } OCT
            </p>
          </div>
        </div>
      )}

      {/* Transaction Result */}
      {txResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
            Transaction Successful!
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Digest: {txResult.digest}
          </p>
          <a
            href={`https://suiscan.xyz/testnet/tx/${txResult.digest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View on Explorer →
          </a>
        </div>
      )}

      {/* Connection Prompt */}
      {!currentAccount && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-yellow-800 dark:text-yellow-300">
            Please connect your OneChain wallet to interact with farming pools
          </p>
        </div>
      )}
    </div>
  )
}