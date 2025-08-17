'use client'

import { Transaction, TransactionButton, TransactionStatus, TransactionStatusAction, TransactionStatusLabel } from '@coinbase/onchainkit/transaction'
import { useAccount } from 'wagmi'
import { base } from 'wagmi/chains'

export function TransactionComponent() {
  const { address } = useAccount()

  const handleOnStatus = (status: any) => {
    console.log('Transaction status:', status)
  }

  if (!address) {
    return (
      <div className="text-gray-500">
        Please connect your wallet to make transactions
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Make a Transaction</h3>
      
      <Transaction
        chainId={base.id}
        onStatus={handleOnStatus}
      >
        <TransactionButton
          text="Send Payment"
          disabled={!address}
        />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  )
}