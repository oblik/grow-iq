'use client'

import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction, useCurrentWallet } from '@mysten/dapp-kit'
import { createInvestmentHandler, createInvestmentTransaction, InvestmentRequest, InvestmentResult } from '@/lib/investment-transactions'
import { Transaction } from '@mysten/sui/transactions'

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
        // Check if we have OneChain wallet
        const isOneChain = currentWallet?.name?.toLowerCase().includes('onechain') || 
                          window.localStorage?.getItem('wallet_network') === 'onechain'
        
        // Create a REAL transaction for testnet
        const tx = new Transaction()
        
        // Convert GUI amount to SUI for transaction
        // Using conversion rate: 1000 GUI = 1 SUI for demo
        const suiAmount = request.amount / 1000;
        
        // Convert to MIST (smallest unit)
        const amountInMist = Math.floor(suiAmount * 1e9)
        
        
        if (amountInMist > 0) {
          // For testnet demo: Create a simple transfer
          // This demonstrates real transaction flow
          const [coin] = tx.splitCoins(tx.gas, [amountInMist])
          
          // Transfer to a burn address for demo (real contract would handle this)
          // Using a known test address that accepts transfers
          tx.transferObjects(
            [coin],
            '0x7b8e0864967427679b4e129f79dc332a885c6087ec9e187b53451a9006ee15f2' // Testnet demo address
          )
        }
        
        // Set reasonable gas budget for testnet
        tx.setGasBudget(10000000) // 0.01 SUI for gas
        
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
                gasUsed: result.effects?.gasUsed?.computationCost ? 
                  (Number(result.effects.gasUsed.computationCost) / 1e9).toFixed(4) : '0.001',
              })
            },
            onError: (error) => {
              console.error('Transaction failed:', error)
              resolve({
                success: false,
                error: `Transaction failed: ${error.message || 'Unknown error'}. Make sure you have testnet tokens!`,
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