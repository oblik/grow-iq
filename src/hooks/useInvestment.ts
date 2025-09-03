'use client'

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { createInvestmentHandler } from '@/lib/investment-transactions'

export function useInvestment() {
  const currentAccount = useCurrentAccount()
  const client = useSuiClient()
  
  if (!currentAccount) {
    return {
      makeInvestment: async () => ({ 
        success: false, 
        error: 'Wallet not connected' 
      }),
      checkInvestmentStatus: async () => null,
      withdrawInvestment: async () => ({ 
        success: false, 
        error: 'Wallet not connected' 
      }),
      harvestRewards: async () => ({ 
        success: false, 
        error: 'Wallet not connected' 
      }),
      isWalletConnected: false,
      walletAddress: null,
    }
  }
  
  const handler = createInvestmentHandler(currentAccount)
  
  return {
    ...handler,
    isWalletConnected: true,
    walletAddress: currentAccount.address,
  }
}