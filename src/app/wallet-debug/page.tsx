'use client'

import { ConnectButton, useWallets, useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit'
import { useEffect, useState } from 'react'

export default function WalletDebugPage() {
  const wallets = useWallets()
  const currentAccount = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const [windowInfo, setWindowInfo] = useState<any>({})

  useEffect(() => {
    // Check for wallet extensions in window object
    const info: any = {}
    if (typeof window !== 'undefined') {
      info.hasSuiWallet = !!(window as any).suiWallet
      info.hasSuiet = !!(window as any).suiet
      info.hasOkxWallet = !!(window as any).okxwallet
      info.hasMartian = !!(window as any).martian
      info.hasOneChain = !!(window as any).onechain
      
      // Check for any wallet-related properties
      const walletKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('wallet') || 
        key.toLowerCase().includes('sui') ||
        key.toLowerCase().includes('chain')
      )
      info.walletKeys = walletKeys
    }
    setWindowInfo(info)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Debug Information</h1>
      
      <div className="space-y-6">
        {/* Connect Button */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Connect Button</h2>
          <ConnectButton />
        </div>

        {/* Available Wallets */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Available Wallets ({wallets.length})</h2>
          {wallets.length === 0 ? (
            <p className="text-red-400">No wallets detected! Please install a Sui-compatible wallet extension.</p>
          ) : (
            <div className="space-y-2">
              {wallets.map((wallet, i) => (
                <div key={i} className="p-2 bg-gray-700 rounded">
                  <p><strong>Name:</strong> {wallet.name}</p>
                  <p className="text-sm text-gray-400"><strong>Version:</strong> {wallet.version || 'N/A'}</p>
                  <p className="text-sm text-gray-400"><strong>Icon:</strong> {wallet.icon || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Window Object Check */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Window Object Wallet Properties</h2>
          <div className="space-y-1 text-sm">
            <p>✓ window.suiWallet: {windowInfo.hasSuiWallet ? '✅ Found' : '❌ Not found'}</p>
            <p>✓ window.suiet: {windowInfo.hasSuiet ? '✅ Found' : '❌ Not found'}</p>
            <p>✓ window.okxwallet: {windowInfo.hasOkxWallet ? '✅ Found' : '❌ Not found'}</p>
            <p>✓ window.martian: {windowInfo.hasMartian ? '✅ Found' : '❌ Not found'}</p>
            <p>✓ window.onechain: {windowInfo.hasOneChain ? '✅ Found' : '❌ Not found'}</p>
            {windowInfo.walletKeys?.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Other wallet-related keys:</p>
                <pre className="text-xs bg-gray-700 p-2 rounded mt-1">
                  {windowInfo.walletKeys.join(', ')}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Current Connection */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Current Connection</h2>
          {currentAccount ? (
            <div className="space-y-2">
              <p><strong>Address:</strong> {currentAccount.address}</p>
              <p><strong>Wallet:</strong> {currentWallet?.name || 'Unknown'}</p>
            </div>
          ) : (
            <p className="text-gray-400">Not connected</p>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">📝 Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Install a Sui-compatible wallet extension:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• <a href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" target="_blank" className="text-blue-400 hover:underline">Sui Wallet (Official)</a></li>
                <li>• <a href="https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd" target="_blank" className="text-blue-400 hover:underline">Suiet Wallet</a></li>
                <li>• <a href="https://www.martianwallet.xyz/" target="_blank" className="text-blue-400 hover:underline">Martian Wallet</a></li>
              </ul>
            </li>
            <li>Refresh the page after installing a wallet</li>
            <li>Make sure the wallet extension is enabled</li>
            <li>Try a different browser (Chrome/Brave recommended)</li>
            <li>Check if any ad blockers are interfering</li>
          </ol>
        </div>
      </div>
    </div>
  )
}