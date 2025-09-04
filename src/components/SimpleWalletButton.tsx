'use client'

import { ConnectButton, useWallets } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import { useEffect } from 'react'

export function SimpleWalletButton() {
  const wallets = useWallets()
  
  useEffect(() => {
    console.log('Available wallets:', wallets)
    if (wallets.length === 0) {
      console.error('No wallets detected! Please install a Sui wallet extension.')
    }
  }, [wallets])
  
  return <ConnectButton />
}