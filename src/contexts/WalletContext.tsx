'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useCurrentAccount, useCurrentWallet, useSuiClientQuery, useDisconnectWallet, useSuiClient } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  connect: () => void
  disconnect: () => void
  currentAccount: any
  currentWallet: any
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const client = useSuiClient()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')

  // Query all balances when account is connected
  const { data: allBalances } = useSuiClientQuery(
    'getAllBalances',
    {
      owner: currentAccount?.address || '',
    },
    {
      enabled: !!currentAccount?.address,
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  )
  
  // Also query SUI balance specifically
  const { data: suiBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!currentAccount?.address,
      refetchInterval: 5000,
    }
  )

  useEffect(() => {
    if (currentAccount) {
      setIsConnected(true)
      setAddress(currentAccount.address)
    } else {
      setIsConnected(false)
      setAddress(null)
    }
  }, [currentAccount])

  // Update balance from all available sources
  useEffect(() => {
    if (allBalances && allBalances.length > 0) {
      
      // Find SUI balance
      const suiCoin = allBalances.find(b => b.coinType === '0x2::sui::SUI')
      if (suiCoin) {
        const suiAmount = Number(suiCoin.totalBalance) / 1e9
        setBalance(suiAmount.toFixed(4))
      } else {
        // If no SUI, check for any other balance
        const firstBalance = allBalances[0]
        const amount = Number(firstBalance.totalBalance) / 1e9
        setBalance(amount.toFixed(4))
      }
    } else if (suiBalance) {
      // Fallback to specific SUI balance query
      const suiAmount = Number(suiBalance.totalBalance) / 1e9
      setBalance(suiAmount.toFixed(4))
    }
  }, [allBalances, suiBalance])
  
  // Also fetch balance manually when account changes
  useEffect(() => {
    if (currentAccount?.address && client) {
      // Manual balance fetch as backup
      client.getAllBalances({ owner: currentAccount.address })
        .then(balances => {
          if (balances.length > 0) {
            const suiCoin = balances.find(b => b.coinType === '0x2::sui::SUI')
            if (suiCoin) {
              const amount = Number(suiCoin.totalBalance) / 1e9
              setBalance(amount.toFixed(4))
            }
          }
        })
        .catch(err => console.error('Error fetching balance:', err))
    }
  }, [currentAccount?.address, client])

  const connect = () => {
    // Wallet connection is handled by the dapp-kit ConnectButton
  }

  const disconnect = () => {
    disconnectWallet()
  }

  return (
    <WalletContext.Provider 
      value={{ 
        isConnected, 
        address, 
        balance, 
        connect, 
        disconnect,
        currentAccount,
        currentWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Helper function to format address for display
export function formatWalletAddress(address: string | null): string {
  if (!address) return ''
  return formatAddress(address)
}