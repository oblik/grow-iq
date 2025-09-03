'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useCurrentAccount, useCurrentWallet, useSuiClientQuery, useDisconnectWallet } from '@mysten/dapp-kit'
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
  const { mutate: disconnectWallet } = useDisconnectWallet()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')

  // Query balance when account is connected
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: '0x2::oct::OCT', // OneChain native token
    },
    {
      enabled: !!currentAccount?.address,
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

  useEffect(() => {
    if (balanceData) {
      // Convert from MIST to OCT (1 OCT = 1e9 MIST)
      const octBalance = Number(balanceData.totalBalance) / 1e9
      setBalance(octBalance.toFixed(4))
    }
  }, [balanceData])

  const connect = () => {
    // Wallet connection is handled by the dapp-kit ConnectButton
    console.log('Connect wallet through OneChain wallet button')
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