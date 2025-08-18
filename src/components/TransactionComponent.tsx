'use client'

import React from 'react'
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusAction, TransactionStatusLabel } from '@coinbase/onchainkit/transaction'
import { useAccount } from 'wagmi'
import { base } from 'wagmi/chains'
import { useHydration } from '@/hooks/useHydration'

export function TransactionComponent() {
  const { address } = useAccount()
  const isHydrated = useHydration()

  const handleOnStatus = (status: any) => {
    console.log('Transaction status:', status)
  }

  // Example agricultural smart contract interaction
  // This simulates staking tokens in a crop investment pool
  const transactionCalls = React.useMemo(() => [
    {
      to: '0x4200000000000000000000000000000000000006' as `0x${string}`, // WETH on Base (example)
      value: BigInt('0'), // No direct ETH value for contract call
      data: '0xa9059cbb0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000002386f26fc10000' as `0x${string}`, // ERC20 transfer example
    }
  ], [])

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-full rounded"></div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border text-center">
        Please connect your wallet to make transactions
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Agricultural Payments</h3>
      <p className="text-sm text-gray-600">
        Stake tokens in agricultural investment pools or send payments to farmers
      </p>
      
      {isHydrated && address && transactionCalls && transactionCalls.length > 0 ? (
        <Transaction
          chainId={base.id}
          calls={transactionCalls}
          onStatus={handleOnStatus}
        >
          <TransactionButton
            text="Stake in Crop Pool (Demo)"
            disabled={!address}
          />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
        </Transaction>
      ) : (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">Transaction interface will appear here once wallet is connected</p>
          <p className="text-sm text-gray-500 mt-2">Connect your wallet to access agricultural payment features</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
        <strong>Note:</strong> This is a demo transaction. In production, this would integrate with your agricultural investment pools and smart contracts.
      </div>
    </div>
  )
}