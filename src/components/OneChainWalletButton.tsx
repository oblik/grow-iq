'use client'

import { ConnectButton, useCurrentAccount, useSuiClientQuery, useDisconnectWallet, useCurrentWallet, useSuiClient } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { Wallet, LogOut, User, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OneChainWalletButton() {
  const currentAccount = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const client = useSuiClient()
  const { mutate: disconnect } = useDisconnectWallet()
  const [balance, setBalance] = useState('0')
  const [isOneChain, setIsOneChain] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Query all balances
  const { data: allBalances, refetch: refetchBalance } = useSuiClientQuery(
    'getAllBalances',
    {
      owner: currentAccount?.address || '',
    },
    {
      enabled: !!currentAccount?.address,
      refetchInterval: 10000, // Auto refresh every 10 seconds
    }
  )

  useEffect(() => {
    if (allBalances && allBalances.length > 0) {
      
      // Find SUI balance first
      const suiCoin = allBalances.find(b => b.coinType === '0x2::sui::SUI')
      if (suiCoin) {
        const suiAmount = Number(suiCoin.totalBalance) / 1e9
        setBalance(suiAmount.toFixed(4))
      } else {
        // Use first available balance
        const firstBalance = allBalances[0]
        const amount = Number(firstBalance.totalBalance) / 1e9
        setBalance(amount.toFixed(4))
      }
    }
  }, [allBalances])
  
  const handleRefresh = async () => {
    if (!currentAccount?.address || !client) return
    
    setIsRefreshing(true)
    try {
      const balances = await client.getAllBalances({ owner: currentAccount.address })
      
      if (balances.length > 0) {
        const suiCoin = balances.find(b => b.coinType === '0x2::sui::SUI')
        if (suiCoin) {
          const amount = Number(suiCoin.totalBalance) / 1e9
          setBalance(amount.toFixed(4))
        } else {
          const amount = Number(balances[0].totalBalance) / 1e9
          setBalance(amount.toFixed(4))
        }
      }
      refetchBalance()
    } catch (err) {
      console.error('Error refreshing balance:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Detect if OneChain wallet is being used
    if (currentWallet) {
      const walletName = currentWallet.name?.toLowerCase()
      // Check if it's OneChain wallet or if user has OneChain extension
      const isOneChainWallet = walletName?.includes('onechain') || 
                               walletName?.includes('one chain') ||
                               window.localStorage?.getItem('preferred_wallet') === 'onechain'
      setIsOneChain(isOneChainWallet)
      
      // Store network preference
      if (isOneChainWallet) {
        window.localStorage?.setItem('wallet_network', 'onechain')
      }
    }
  }, [currentWallet])

  return (
    <div className="flex items-center gap-2">
      <ConnectButton 
        connectText="Connect Wallet"
        className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !px-4 !py-2 !rounded-lg !font-medium !transition-all hover:!from-blue-700 hover:!to-purple-700 !border-0"
      />
      {currentAccount && (
        <div className="flex items-center gap-3 bg-white/10 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-200">
              {formatAddress(currentAccount.address)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="font-bold text-white">{balance} SUI</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`w-3 h-3 text-gray-400 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {isOneChain && (
            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">OneChain</span>
          )}
          <button
            onClick={() => disconnect()}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      )}
    </div>
  )
}