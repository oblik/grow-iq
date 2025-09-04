'use client'

import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction, useCurrentWallet } from '@mysten/dapp-kit'
import { createInvestmentHandler, InvestmentRequest, InvestmentResult } from '@/lib/investment-transactions'
import { Transaction } from '@mysten/sui/transactions'
import { onechainTxBuilder } from '@/lib/onechain-transactions'
import { ONECHAIN_CONFIG } from '@/config/onechain'

export function useInvestment() {
  const currentAccount = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const client = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  // Enhanced investment function with REAL testnet transaction execution
  const makeInvestment = async (request: InvestmentRequest): Promise<InvestmentResult> => {
    if (!currentAccount) {
      return {
        success: false,
        error: 'Please connect your wallet first'
      }
    }

    return new Promise((resolve) => {
      try {
        // Use OneChain
        const isOneChain = true;
        
        // Create transaction for OneChain
        const tx = new Transaction()
        
        // Convert GUI amount to OCT
        const tokenAmount = request.amount / 1000; // 1000 GUI = 1 OCT
        
        // Convert to smallest unit (MIST for SUI, or OneChain equivalent)
        const amountInMist = Math.floor(tokenAmount * 1e9)
        
        
        if (amountInMist > 0) {
          // For OneChain: Create a simple transfer
          const [coin] = tx.splitCoins(tx.gas, [amountInMist])
          
          // Transfer to a demo address for testing
          tx.transferObjects(
            [coin],
            '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2' // Testnet demo address
          )
        }
        
        // Set reasonable gas budget for OneChain testnet
        tx.setGasBudget(10000000) // 0.01 OCT for gas
        
        // EXECUTE REAL TRANSACTION ON TESTNET
        signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: (result) => {
              resolve({
                success: true,
                transactionDigest: result.digest,
                timestamp: Date.now(),
                gasUsed: (result as any).effects?.gasUsed?.computationCost ? 
                  (Number((result as any).effects.gasUsed.computationCost) / 1e9).toFixed(4) : '0.001',
              })
            },
            onError: (error) => {
              console.error('Transaction failed:', error)
              resolve({
                success: false,
                error: `Transaction failed: ${error.message || 'Unknown error'}. Make sure you have OneChain (OCT) testnet tokens!`,
              })
            },
          }
        )
      } catch (error) {
        console.error('Investment transaction error:', error)
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Transaction failed - check wallet connection',
        })
      }
    })
  }
  
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
  
  // Use the fallback handler for other functions
  const handler = createInvestmentHandler(currentAccount)
  
  return {
    makeInvestment, // Use our enhanced version
    checkInvestmentStatus: handler.checkInvestmentStatus,
    withdrawInvestment: handler.withdrawInvestment,
    harvestRewards: handler.harvestRewards,
    isWalletConnected: true,
    walletAddress: currentAccount.address,
  }
}