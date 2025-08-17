'use client'

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance } from 'wagmi'

export function WalletConnector() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

  return (
    <div className="flex items-center gap-4">
      <Wallet>
        <ConnectWallet>
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
      
      {isConnected && (
        <div className="text-sm text-gray-600">
          Balance: {balance?.formatted} {balance?.symbol}
        </div>
      )}
    </div>
  )
}