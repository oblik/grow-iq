'use client'

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'
// import { useOneChainAuth } from '@/hooks/useOneChainAuth' // Removed - not needed
import { OneChainWalletButton } from '@/components/OneChainWalletButton'
import { Header } from '@/components/Header'

export default function OneChainDemoPage() {
  const currentAccount = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  // const { isAuthenticated, authenticate, session } = useOneChainAuth() // Not needed
  const [txResult, setTxResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSendTransaction = async () => {
    if (!currentAccount) {
      alert('Please connect your OneChain wallet first')
      return
    }

    setLoading(true)
    try {
      const tx = new Transaction()
      
      // Example: Split some OCT coins for testing
      const [coin] = tx.splitCoins(tx.gas, [1000000]) // Split 0.001 OCT
      tx.transferObjects([coin], currentAccount.address)

      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result)
            setTxResult(result)
            setLoading(false)
          },
          onError: (error) => {
            console.error('Transaction failed:', error)
            setLoading(false)
          },
        }
      )
    } catch (error) {
      console.error('Error creating transaction:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
            OneChain Integration Demo
          </h1>

          <div className="space-y-6">
            {/* Wallet Connection Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Wallet Connection
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Connection Status:</span>
                  <span className={`font-medium ${currentAccount ? 'text-green-600' : 'text-red-600'}`}>
                    {currentAccount ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {currentAccount && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Address:</span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Chain:</span>
                      <span className="font-medium">OneChain (SUI-based)</span>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <OneChainWalletButton />
                </div>
              </div>
            </div>

            {/* Authentication Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Authentication
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Auth Status:</span>
                  <span className={`font-medium ${currentAccount ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentAccount ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {currentAccount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Wallet User:</span>
                    <span className="font-medium">OneChain User</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Section */}
            {currentAccount && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Test Transaction
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Send a test transaction to split 0.001 OCT coins
                </p>

                <button
                  onClick={handleSendTransaction}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Processing...' : 'Send Test Transaction'}
                </button>

                {txResult && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      Transaction Successful!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Digest: {txResult.digest}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* API Documentation Reference */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                OneChain API Features
              </h2>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">Wallet Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate addresses, manage keypairs (ED25519, Secp256k1, Secp256r1)
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">Transaction Execution</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Execute signed transactions, transfer OCT tokens, manage gas
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">Smart Contracts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Deploy Move modules, call functions, manage objects
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">Network Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect to Devnet, Testnet, Mainnet, or local networks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}