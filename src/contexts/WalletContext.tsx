'use client'

import React, { createContext, useContext, useState } from 'react'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState('0')

  const connect = () => {
    setIsConnected(true)
    setAddress('0xABC123...DEF456')
    setBalance('1.2345')
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance('0')
  }

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, connect, disconnect }}>
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