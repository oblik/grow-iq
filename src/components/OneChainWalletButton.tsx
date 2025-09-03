'use client'

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { Wallet, LogOut, User } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export function OneChainWalletButton() {
  const currentAccount = useCurrentAccount()
  const { balance, disconnect } = useWallet()

  return (
    <div className="flex items-center gap-2">
      <ConnectButton 
        connectText="Connect OneChain"
        connectedText={currentAccount ? formatAddress(currentAccount.address) : 'Connected'}
        className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !px-4 !py-2 !rounded-lg !font-medium !transition-all hover:!from-blue-700 hover:!to-purple-700 !border-0"
      >
        {currentAccount ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">
                {formatAddress(currentAccount.address)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="font-bold">{balance} OCT</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                disconnect()
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>Connect OneChain</span>
          </div>
        )}
      </ConnectButton>
    </div>
  )
}