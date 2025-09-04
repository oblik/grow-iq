'use client'

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

export default function TestWalletPage() {
  const account = useCurrentAccount()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Basic ConnectButton:</p>
          <ConnectButton />
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Connection Status:</p>
          <p className="text-lg">
            {account ? `Connected: ${account.address}` : 'Not connected'}
          </p>
        </div>

        {account && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Account Details:</p>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(account, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}