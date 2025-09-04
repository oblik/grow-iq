'use client'

import { useState, useEffect } from 'react'
import { Network, AlertCircle, CheckCircle } from 'lucide-react'
import { useCurrentWallet } from '@mysten/dapp-kit'

export function NetworkSwitcher() {
  const [currentNetwork, setCurrentNetwork] = useState<'sui' | 'onechain'>('sui')
  const [showNetworkInfo, setShowNetworkInfo] = useState(false)
  const currentWallet = useCurrentWallet()
  
  useEffect(() => {
    // Check localStorage for network preference
    const stored = window.localStorage?.getItem('wallet_network')
    if (stored === 'onechain' && process.env.NEXT_PUBLIC_ENABLE_ONECHAIN === 'true') {
      setCurrentNetwork('onechain')
    } else {
      setCurrentNetwork('sui')
    }
  }, [])
  
  const switchNetwork = (network: 'sui' | 'onechain') => {
    if (network === 'onechain' && process.env.NEXT_PUBLIC_ENABLE_ONECHAIN !== 'true') {
      alert('OneChain network is currently disabled due to epoch synchronization. Please use Sui testnet.')
      return
    }
    
    window.localStorage?.setItem('wallet_network', network)
    setCurrentNetwork(network)
    // Reload to apply network change
    window.location.reload()
  }
  
  return (
    <>
      <button
        onClick={() => setShowNetworkInfo(!showNetworkInfo)}
        className="fixed bottom-6 left-6 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all z-40"
        title="Network Info"
      >
        <Network className="w-5 h-5" />
      </button>
      
      {showNetworkInfo && (
        <div className="fixed bottom-20 left-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-40 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Network Status</h3>
            <button
              onClick={() => setShowNetworkInfo(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Current Network */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm font-medium">Current Network:</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {currentNetwork === 'onechain' ? 'OneChain' : 'Sui'} Testnet
              </span>
            </div>
            
            {/* Network Options */}
            <div className="space-y-2">
              <button
                onClick={() => switchNetwork('sui')}
                className={`w-full p-2 rounded flex items-center justify-between transition-colors ${
                  currentNetwork === 'sui'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sui Testnet</span>
                  {currentNetwork === 'sui' && <CheckCircle className="w-4 h-4" />}
                </span>
                <span className="text-xs text-gray-500">Recommended</span>
              </button>
              
              <button
                onClick={() => switchNetwork('onechain')}
                className={`w-full p-2 rounded flex items-center justify-between transition-colors ${
                  currentNetwork === 'onechain'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                disabled={process.env.NEXT_PUBLIC_ENABLE_ONECHAIN !== 'true'}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium">OneChain Testnet</span>
                  {currentNetwork === 'onechain' && <CheckCircle className="w-4 h-4" />}
                </span>
                <span className="text-xs text-gray-500">
                  {process.env.NEXT_PUBLIC_ENABLE_ONECHAIN === 'true' ? 'Available' : 'Coming Soon'}
                </span>
              </button>
            </div>
            
            {/* Status Info */}
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-700 dark:text-yellow-400">
                <p className="font-medium">Network Note:</p>
                <p>Currently using Sui testnet for all transactions. OneChain integration is being synchronized.</p>
              </div>
            </div>
            
            {/* RPC Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>RPC: {currentNetwork === 'sui' ? 'fullnode.testnet.sui.io' : 'rpc-testnet.onelabs.cc'}</p>
              {currentWallet && (
                <p>Wallet: {currentWallet.name}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}