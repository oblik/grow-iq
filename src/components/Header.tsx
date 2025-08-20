'use client'

import { AuthButton } from './AuthButton'
import { WalletConnector } from './WalletConnector'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">GrowIQ</h1>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Agricultural Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <AuthButton />
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  )
}