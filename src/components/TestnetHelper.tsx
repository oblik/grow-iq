'use client'

import { useState } from 'react'
import { X, Droplets, Info, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'

export function TestnetHelper() {
  const [showHelper, setShowHelper] = useState(false)
  const [copied, setCopied] = useState(false)
  const currentAccount = useCurrentAccount()

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelper(true)}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all z-40 group"
        title="Get Testnet Tokens"
      >
        <Droplets className="w-6 h-6" />
        <span className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Get Free Testnet Tokens
        </span>
      </button>

      {/* Helper Modal */}
      {showHelper && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Droplets className="text-blue-600" />
                    Get Free Testnet Tokens
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You need testnet tokens to make transactions (100% FREE)
                  </p>
                </div>
                <button
                  onClick={() => setShowHelper(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {currentAccount ? (
                <>
                  {/* Your Address */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Your Wallet Address
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                        {currentAccount.address}
                      </code>
                      <button
                        onClick={copyAddress}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Method 1: Web Faucet */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                      Web Faucet (Easiest)
                    </h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">1.</span>
                        <span>Visit the Sui Testnet Faucet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">2.</span>
                        <span>Enter your wallet address (copied above)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">3.</span>
                        <span>Click "Request Tokens"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">4.</span>
                        <span>You'll receive 1 SUI (can request every hour)</span>
                      </li>
                    </ol>
                    <a
                      href="https://faucet.testnet.sui.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Open Sui Faucet
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Method 2: Discord */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                      Discord Faucet (More tokens)
                    </h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">1.</span>
                        <span>Join Sui Discord server</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">2.</span>
                        <span>Go to #testnet-faucet channel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">3.</span>
                        <span>Type: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">!faucet {formatAddress(currentAccount.address)}</code></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-500">4.</span>
                        <span>You'll receive 10 SUI instantly!</span>
                      </li>
                    </ol>
                    <a
                      href="https://discord.gg/sui"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Join Sui Discord
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Tips */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p className="font-medium text-green-900 dark:text-green-300">Tips:</p>
                        <ul className="space-y-1 text-green-800 dark:text-green-400">
                          <li>• Testnet tokens are 100% FREE - never pay for them</li>
                          <li>• Keep at least 0.1 SUI for gas fees</li>
                          <li>• Transactions on testnet don't affect real money</li>
                          <li>• Perfect for testing without any risk</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connect Wallet First</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please connect your wallet to get your address for receiving testnet tokens
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}