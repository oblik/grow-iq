'use client'

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance } from 'wagmi'
import { useHydration } from '@/hooks/useHydration'

export function WalletConnector() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const isHydrated = useHydration()

  return (
    <div className="flex items-center gap-4">
      <div className="wallet-connector">
        <Wallet>
          <ConnectWallet className="!bg-blue-600 !text-white hover:!bg-blue-700 !px-4 !py-2 !rounded-lg !font-medium !transition-colors">
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
      
      {isHydrated && isConnected && (
        <div className="text-sm text-gray-800 font-medium bg-white/95 px-3 py-1 rounded-lg border shadow-sm">
          Balance: {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} {balance?.symbol || 'ETH'}
        </div>
      )}
    </div>
  )
}