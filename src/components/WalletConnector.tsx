'use client'

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance } from 'wagmi'
import { useHydration } from '@/hooks/useHydration'
import { useWallet } from '@/contexts/WalletContext'

export function WalletConnector() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const isHydrated = useHydration()
  const { isConnected: walletIsConnected, address: walletAddress, balance: walletBalance, connect, disconnect } = useWallet()
  
  // Use shared wallet context for demo, fallback to real wallet if available
  const currentWallet = walletIsConnected ? { address: walletAddress, balance: walletBalance } : (isConnected ? { address, balance: balance?.formatted || '0' } : null)

  return (
    <div className="flex items-center gap-4">
      {currentWallet ? (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-800 dark:text-gray-200 font-medium bg-white/95 dark:bg-gray-800/95 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            Balance: {parseFloat(currentWallet.balance).toFixed(4)} ETH
          </div>
          <button
            onClick={walletIsConnected ? disconnect : undefined}
            className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
          
          {/* Keep original OnchainKit component as fallback */}
          <div className="wallet-connector opacity-50">
            <Wallet>
              <ConnectWallet className="!bg-gray-500 !text-white hover:!bg-gray-600 !px-3 !py-1 !rounded !text-xs !transition-colors">
                <WalletDropdown>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://wallet.coinbase.com"
                  >
                    Go to Wallet
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      )}
    </div>
  )
}