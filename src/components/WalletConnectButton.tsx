'use client'

import { useCurrentAccount, useDisconnectWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { useState, useEffect } from 'react'

export function WalletConnectButton() {
  const account = useCurrentAccount()
  const wallets = useWallets()
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const [showWalletList, setShowWalletList] = useState(false)

  // Log for debugging
  useEffect(() => {
    console.log('Wallets available:', wallets)
    console.log('Current account:', account)
  }, [wallets, account])

  const handleConnect = () => {
    if (wallets.length === 0) {
      alert('No wallet detected! Please install Sui Wallet, Suiet, or another compatible wallet.')
      return
    }
    
    // If only one wallet, connect directly
    if (wallets.length === 1) {
      connect({ wallet: wallets[0] })
    } else {
      // Show wallet selection
      setShowWalletList(true)
    }
  }

  const handleWalletSelect = (wallet: any) => {
    connect({ wallet })
    setShowWalletList(false)
  }

  // If connected, show account info and disconnect button
  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="text-sm">{formatAddress(account.address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Not connected - show connect button
  return (
    <>
      <button
        onClick={handleConnect}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
      >
        Connect Wallet
      </button>

      {/* Wallet selection modal */}
      {showWalletList && wallets.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Select Wallet</h3>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet)}
                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  {wallet.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowWalletList(false)}
              className="mt-4 w-full p-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}