'use client'

import { AuthButton } from './AuthButton'
import { WalletConnector } from './WalletConnector'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-600">GrowIQ</h1>
            <span className="text-gray-700 font-medium">Agricultural Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <AuthButton />
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  )
}