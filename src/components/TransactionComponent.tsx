'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useHydration } from '@/hooks/useHydration'
import { RealTransactionComponent } from './RealTransactionComponent'

export function TransactionComponent() {
  const { address, isConnected } = useAccount()
  const isHydrated = useHydration()

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-full rounded"></div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
        Please connect your wallet to make transactions
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agricultural Investments</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Stake GUI tokens in real farming operations and earn yields based on harvest outcomes.
      </p>
      
      <RealTransactionComponent 
        poolId={0}
        fieldName="Wheat Farm F1"
      />
      
      <div className="text-xs text-gray-500 bg-green-50 border border-green-200 rounded p-3">
        <strong>🌾 Active Pool:</strong> Field F1 (Wheat) is live with real smart contracts on testnet. 
        Other fields will be available soon as we expand the platform.
      </div>
    </div>
  )
}