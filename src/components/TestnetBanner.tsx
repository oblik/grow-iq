'use client'

import { AlertCircle } from 'lucide-react'

export function TestnetBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        <span>🎯 OneChain TESTNET MODE - Using FREE OCT test tokens - No real money involved!</span>
        <span className="hidden md:inline">• Get free OCT tokens with the blue button (bottom right)</span>
      </div>
    </div>
  )
}