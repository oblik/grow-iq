'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { Loader2, DollarSign, CheckCircle, AlertCircle, Zap, TrendingUp, Clock } from 'lucide-react'
import { useHydration } from '@/hooks/useHydration'
import { 
  useContractAddresses,
  useGUITokenBalance,
  useGUITokenAllowance,
  useGUITokenApprove,
  useFarmingPoolInfo,
  useUserStake,
  useCalculateRewards,
  useStakeTokens,
  useUnstakeTokens,
  useClaimRewards,
  useTransactionStatus,
  getRiskLevelName
} from '@/contracts/hooks'

interface RealTransactionComponentProps {
  poolId?: number
  fieldName?: string
  onClose?: () => void
}

export function RealTransactionComponent({ 
  poolId = 0, 
  fieldName = "Wheat Farm F1",
  onClose 
}: RealTransactionComponentProps) {
  const { address, isConnected } = useAccount()
  const isHydrated = useHydration()
  const { guiToken, farmingPool, isSupported } = useContractAddresses()
  
  const [amount, setAmount] = useState('100')
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake')
  
  // Contract data hooks
  const { data: guiBalance } = useGUITokenBalance(address)
  const { data: allowance } = useGUITokenAllowance(address, farmingPool)
  const { data: poolInfo } = useFarmingPoolInfo(poolId)
  const { data: userStake } = useUserStake(poolId, address)
  const { data: pendingRewards } = useCalculateRewards(poolId, address)
  
  // Transaction hooks
  const { approve, ...approveStatus } = useGUITokenApprove()
  const { stake, ...stakeStatus } = useStakeTokens()
  const { unstake, ...unstakeStatus } = useUnstakeTokens()
  const { claimRewards, ...claimStatus } = useClaimRewards()
  
  // Transaction receipt hooks
  const approveReceipt = useTransactionStatus(approveStatus.data)
  const stakeReceipt = useTransactionStatus(stakeStatus.data)
  const unstakeReceipt = useTransactionStatus(unstakeStatus.data)
  const claimReceipt = useTransactionStatus(claimStatus.data)

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="text-gray-700 dark:text-gray-300 mb-4">Please connect your wallet to access DeFi features</p>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200 mb-2">Network Not Supported</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Please switch to a supported network (Sepolia, Base Sepolia, or Localhost)
        </p>
      </div>
    )
  }

  const hasEnoughBalance = guiBalance && parseEther(amount) <= guiBalance
  const hasEnoughAllowance = allowance && parseEther(amount) <= allowance
  const needsApproval = !hasEnoughAllowance && parseEther(amount) > BigInt(0)
  const hasActiveStake = userStake && userStake[0] > BigInt(0) && userStake[4] // amount > 0 and isActive
  const canUnstake = userStake && userStake[2] < BigInt(Math.floor(Date.now() / 1000)) // unlockTime < now
  const hasPendingRewards = pendingRewards && pendingRewards > BigInt(0)

  const handleApprove = () => {
    approve(farmingPool, parseEther(amount))
  }

  const handleStake = () => {
    stake(poolId, amount)
  }

  const handleUnstake = () => {
    unstake(poolId)
  }

  const handleClaimRewards = () => {
    claimRewards(poolId)
  }

  const getTransactionStatus = () => {
    if (approveStatus.isPending || approveReceipt.isLoading) {
      return { type: 'loading', message: 'Approving tokens...' }
    }
    if (stakeStatus.isPending || stakeReceipt.isLoading) {
      return { type: 'loading', message: 'Staking tokens...' }
    }
    if (unstakeStatus.isPending || unstakeReceipt.isLoading) {
      return { type: 'loading', message: 'Unstaking tokens...' }
    }
    if (claimStatus.isPending || claimReceipt.isLoading) {
      return { type: 'loading', message: 'Claiming rewards...' }
    }
    
    if (approveReceipt.isSuccess) {
      return { type: 'success', message: 'Approval confirmed! You can now stake.' }
    }
    if (stakeReceipt.isSuccess) {
      return { type: 'success', message: 'Staking successful! Tokens locked until harvest.' }
    }
    if (unstakeReceipt.isSuccess) {
      return { type: 'success', message: 'Unstaking successful! Tokens returned to wallet.' }
    }
    if (claimReceipt.isSuccess) {
      return { type: 'success', message: 'Rewards claimed successfully!' }
    }
    
    const error = approveStatus.error || stakeStatus.error || unstakeStatus.error || claimStatus.error
    if (error) {
      return { type: 'error', message: error.message }
    }
    
    return null
  }

  const transactionStatus = getTransactionStatus()

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {fieldName} DeFi Pool
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          )}
        </div>
        {poolInfo && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              getRiskLevelName(Number(poolInfo[9])) === 'Low' ? 'bg-green-100 text-green-800' :
              getRiskLevelName(Number(poolInfo[9])) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getRiskLevelName(Number(poolInfo[9]))} Risk
            </span>
            <span className="ml-2">
              {formatEther(poolInfo[5])}% APY
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-600">
        {['stake', 'unstake', 'rewards'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Portfolio Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Your GUI Balance:</span>
            <span className="font-medium">
              {guiBalance ? formatEther(guiBalance) : '0'} GUI
            </span>
          </div>
          {hasActiveStake && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Staked Amount:</span>
                <span className="font-medium">
                  {userStake ? formatEther(userStake[0]) : '0'} GUI
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pending Rewards:</span>
                <span className="font-medium text-emerald-600">
                  {pendingRewards ? formatEther(pendingRewards) : '0'} GUI
                </span>
              </div>
            </>
          )}
        </div>

        {/* Stake Tab */}
        {activeTab === 'stake' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount to Stake (GUI)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
              {poolInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  Min: {formatEther(poolInfo[2])} GUI | Max: {formatEther(poolInfo[3])} GUI
                </p>
              )}
            </div>

            {!hasEnoughBalance && (
              <div className="text-red-600 text-sm">
                Insufficient GUI balance
              </div>
            )}

            {needsApproval && hasEnoughBalance ? (
              <button
                onClick={handleApprove}
                disabled={approveStatus.isPending || !parseEther(amount)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <Zap size={18} />
                {approveStatus.isPending ? 'Approving...' : `Approve ${amount} GUI`}
              </button>
            ) : (
              <button
                onClick={handleStake}
                disabled={stakeStatus.isPending || !hasEnoughBalance || !hasEnoughAllowance || !parseEther(amount)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <DollarSign size={18} />
                {stakeStatus.isPending ? 'Staking...' : `Stake ${amount} GUI`}
              </button>
            )}
          </div>
        )}

        {/* Unstake Tab */}
        {activeTab === 'unstake' && (
          <div className="space-y-4">
            {hasActiveStake ? (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    {canUnstake ? 'Ready to unstake!' : 'Tokens are locked until harvest period'}
                  </p>
                  {userStake && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Unlock time: {new Date(Number(userStake[2]) * 1000).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={unstakeStatus.isPending || !canUnstake}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <TrendingUp size={18} />
                  {unstakeStatus.isPending ? 'Unstaking...' : 
                   canUnstake ? `Unstake ${userStake ? formatEther(userStake[0]) : '0'} GUI` : 
                   'Locked Until Harvest'}
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active stakes found
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                Available Rewards: {pendingRewards ? formatEther(pendingRewards) : '0'} GUI
              </p>
              {poolInfo && (
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Current APY: {formatEther(poolInfo[5])}%
                </p>
              )}
            </div>

            <button
              onClick={handleClaimRewards}
              disabled={claimStatus.isPending || !hasPendingRewards}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <CheckCircle size={18} />
              {claimStatus.isPending ? 'Claiming...' : 'Claim Rewards'}
            </button>

            {!hasPendingRewards && (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                No rewards available to claim
              </p>
            )}
          </div>
        )}

        {/* Transaction Status */}
        {transactionStatus && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            transactionStatus.type === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' :
            transactionStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
            'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {transactionStatus.type === 'loading' && <Loader2 className="animate-spin" size={16} />}
            {transactionStatus.type === 'success' && <CheckCircle size={16} />}
            {transactionStatus.type === 'error' && <AlertCircle size={16} />}
            <span className="text-sm">{transactionStatus.message}</span>
          </div>
        )}

        {/* Transaction Hashes */}
        {(stakeStatus.data || unstakeStatus.data || claimStatus.data || approveStatus.data) && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {approveStatus.data && (
              <div>Approve: <code>{approveStatus.data.slice(0, 10)}...{approveStatus.data.slice(-8)}</code></div>
            )}
            {stakeStatus.data && (
              <div>Stake: <code>{stakeStatus.data.slice(0, 10)}...{stakeStatus.data.slice(-8)}</code></div>
            )}
            {unstakeStatus.data && (
              <div>Unstake: <code>{unstakeStatus.data.slice(0, 10)}...{unstakeStatus.data.slice(-8)}</code></div>
            )}
            {claimStatus.data && (
              <div>Claim: <code>{claimStatus.data.slice(0, 10)}...{claimStatus.data.slice(-8)}</code></div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}