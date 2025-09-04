'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { 
  X, Wallet, TrendingUp, AlertCircle, CheckCircle, 
  Loader2, ExternalLink, Calculator, Info, Shield 
} from 'lucide-react'
import { calculateReturns, formatTransaction, getExplorerUrl } from '@/lib/investment-transactions'
import { useInvestment } from '@/hooks/useInvestment'
import { OneChainWalletButton } from './OneChainWalletButton'

interface InvestmentModalProps {
  field: {
    field_id: string;
    crop_name: string;
    investment_pool: {
      pool_id: number;
      total_staked: number;
      apy_estimate: number;
      min_stake: number;
      max_stake: number;
      investors_count: number;
      risk_level: 'Low' | 'Medium' | 'High';
      liquidity_locked_until: string;
      is_active: boolean;
    };
    expected_harvest_date: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InvestmentModal({ field, isOpen, onClose, onSuccess }: InvestmentModalProps) {
  const currentAccount = useCurrentAccount()
  const { makeInvestment, isWalletConnected } = useInvestment()
  
  // Set minimum to 10 OCT for testnet
  const [amount, setAmount] = useState(Math.min(field?.investment_pool?.min_stake || 10, 10))
  const [isProcessing, setIsProcessing] = useState(false)
  const [txResult, setTxResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input')

  if (!isOpen || !field) {
    return null;
  }

  const daysToHarvest = Math.ceil(
    (new Date(field.expected_harvest_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const estimatedReturns = calculateReturns(amount, field.investment_pool.apy_estimate, daysToHarvest)
  const totalReturn = amount + estimatedReturns

  const handleInvest = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (amount < field.investment_pool.min_stake || amount > field.investment_pool.max_stake) {
      setError(`Investment must be between ${field.investment_pool.min_stake} and ${field.investment_pool.max_stake} OCT`)
      return
    }

    setStep('confirm')
  }

  const confirmInvestment = async () => {
    setStep('processing')
    setIsProcessing(true)
    setError(null)

    try {
      const result = await makeInvestment({
        poolId: `pool_${field.investment_pool.pool_id}`,
        amount: amount,
        fieldId: field.field_id,
        cropType: field.crop_name,
        expectedAPY: field.investment_pool.apy_estimate,
      })

      if (result.success) {
        setTxResult(result)
        setStep('success')
        
        // Call onSuccess callback after 2 seconds
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Transaction failed')
        setStep('input')
      }
    } catch (err) {
      setError('Transaction failed. Please try again.')
      setStep('input')
    } finally {
      setIsProcessing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invest in {field.crop_name} Farm
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pool #{field.investment_pool.pool_id} • {field.investment_pool.investors_count} investors
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content based on step */}
        <div className="p-6">
          {step === 'input' && (
            <>
              {/* Wallet Connection */}
              {!isWalletConnected && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">
                        Wallet Connection Required
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Connect your OneChain wallet to make investments
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <OneChainWalletButton />
                    </div>
                  </div>
                </div>
              )}

              {/* Pool Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">APY</p>
                  <p className="text-lg font-bold text-green-600">
                    {field.investment_pool.apy_estimate}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Risk Level</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(field.investment_pool.risk_level)}`}>
                    {field.investment_pool.risk_level}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lock Period</p>
                  <p className="text-lg font-bold">{daysToHarvest} days</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Staked</p>
                  <p className="text-lg font-bold">${field.investment_pool.total_staked.toLocaleString()}</p>
                </div>
              </div>

              {/* Investment Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Amount (OCT)
                  <span className="text-xs text-gray-500 ml-2">
                    (Min: 10 OCT)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={field.investment_pool.min_stake}
                    max={field.investment_pool.max_stake}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Min: ${field.investment_pool.min_stake}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    OCT
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Min: {field.investment_pool.min_stake} OCT</span>
                  <span>Max: {field.investment_pool.max_stake} OCT</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  10,  // 0.01 SUI
                  50,  // 0.05 SUI
                  100, // 0.1 SUI
                  500  // 0.5 SUI
                ].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    disabled={val > field.investment_pool.max_stake}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg 
                             hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {val} OCT
                  </button>
                ))}
              </div>

              {/* Returns Calculator */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 
                            rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">Estimated Returns</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                    <span className="font-medium">{amount.toLocaleString()} OCT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Est. Returns ({daysToHarvest} days):
                    </span>
                    <span className="font-medium text-green-600">
                      +{estimatedReturns.toLocaleString()} OCT
                    </span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total at Harvest:</span>
                      <span className="font-bold text-lg text-green-600">
                        {totalReturn.toLocaleString()} GUI
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                              rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 
                           transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={!isWalletConnected || amount < field.investment_pool.min_stake}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 
                           text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Invest Now
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Confirm Investment</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please review your investment details
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Field:</span>
                  <span className="font-medium">{field.crop_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{amount} GUI</span>
                </div>
                <div className="flex justify-between">
                  <span>APY:</span>
                  <span className="font-medium">{field.investment_pool.apy_estimate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Lock Period:</span>
                  <span className="font-medium">{daysToHarvest} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Return:</span>
                  <span className="font-bold text-green-600">{totalReturn.toLocaleString()} GUI</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={confirmInvestment}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 
                           text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700"
                >
                  Confirm & Sign
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Processing Transaction...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please approve the transaction in your wallet
              </p>
            </div>
          )}

          {step === 'success' && txResult && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Investment Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your investment has been processed successfully
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID:</p>
                <p className="font-mono text-sm font-medium">{formatTransaction(txResult.transactionDigest)}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <a
                  href={getExplorerUrl(txResult.transactionDigest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium 
                           hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  View Transaction
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}