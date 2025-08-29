'use client'

import React, { useState } from 'react'
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { Wallet, ChevronDown, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { formatEther } from 'viem'
import { useHydration } from '@/hooks/useHydration'
import { useWallet } from '@/contexts/WalletContext'

export function WalletConnector() {
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const isHydrated = useHydration()
  const { isConnected: walletIsConnected, address: walletAddress, balance: walletBalance, connect: walletConnect, disconnect: walletDisconnect } = useWallet()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const getConnectorIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return '🦊'
      case 'walletconnect':
        return '🔗'
      case 'injected':
        return '💳'
      default:
        return '🔐'
    }
  }

  if (!isHydrated) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded-lg"></div>
    )
  }

  // Use shared wallet context for demo, fallback to real wallet if available
  const currentWallet = walletIsConnected 
    ? { address: walletAddress, balance: walletBalance } 
    : (isConnected ? { address, balance: balance?.formatted || '0' } : null)

  if (currentWallet) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentWallet.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : 'Connected'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {parseFloat(currentWallet.balance).toFixed(4)} ETH
            </div>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-50">
            <div className="p-4 space-y-3">
              {/* Balance Info */}
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Balance</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {balance ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : `${parseFloat(currentWallet.balance).toFixed(4)} ETH`}
                </div>
              </div>

              {/* Address */}
              {currentWallet.address && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <code className="text-xs flex-1 font-mono text-gray-600 dark:text-gray-300">
                    {currentWallet.address}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {copiedAddress ? (
                      <CheckCircle size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-gray-500" />
                    )}
                  </button>
                </div>
              )}

              {/* Connection Info */}
              {connector && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{getConnectorIcon(connector.name)}</span>
                  <span>Connected via {connector.name}</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <a
                  href={`https://etherscan.io/address/${currentWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ExternalLink size={14} />
                  View on Etherscan
                </a>
                
                <button
                  onClick={() => {
                    if (walletIsConnected) {
                      walletDisconnect()
                    } else {
                      disconnect()
                    }
                    setIsDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Wallet size={18} />
        Connect Wallet
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-50">
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Choose a wallet to connect
            </div>
            
            {/* Demo Wallet Option */}
            <button
              onClick={() => {
                walletConnect()
                setIsDropdownOpen(false)
              }}
              className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <span className="text-lg">🎭</span>
              <div>
                <div className="font-medium">Demo Wallet</div>
                <div className="text-xs text-gray-500">For testing purposes</div>
              </div>
            </button>

            {/* Real Wallet Connectors */}
            {connectors
              .filter(connector => connector.id !== 'injected' || typeof window !== 'undefined')
              .map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector })
                    setIsDropdownOpen(false)
                  }}
                  disabled={isPending}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                >
                  <span className="text-lg">{getConnectorIcon(connector.name)}</span>
                  <div>
                    <div className="font-medium">{connector.name}</div>
                    {connector.id === 'walletConnect' && (
                      <div className="text-xs text-gray-500">Scan QR code</div>
                    )}
                  </div>
                </button>
              ))}
          </div>
          
          {error && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-red-600 dark:text-red-400">
                {error.message}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}