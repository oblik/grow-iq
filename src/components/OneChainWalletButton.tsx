'use client'

import { ConnectButton, useCurrentAccount, useSuiClientQuery, useDisconnectWallet } from '@mysten/dapp-kit'
import { formatAddress } from '@mysten/sui/utils'
import { Wallet, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OneChainWalletButton() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [balance, setBalance] = useState('0')

  // Query balance when account is connected
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: '0x2::sui::SUI', // Using SUI for testnet
    },
    {
      enabled: !!currentAccount?.address,
    }
  )

  useEffect(() => {
    if (balanceData) {
      // Convert from MIST to SUI (1 SUI = 1e9 MIST)
      const suiBalance = Number(balanceData.totalBalance) / 1e9
      setBalance(suiBalance.toFixed(4))
    }
  }, [balanceData])

  return (
    <div className="flex items-center gap-2">
      <ConnectButton 
        connectText="Connect OneChain"
        className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !px-4 !py-2 !rounded-lg !font-medium !transition-all hover:!from-blue-700 hover:!to-purple-700 !border-0"
      />
      {currentAccount && (
        <div className="flex items-center gap-3 bg-white/10 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-200">
              {formatAddress(currentAccount.address)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="font-bold text-white">{balance} SUI</span>
          </div>
          <button
            onClick={() => disconnect()}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      )}
    </div>
  )
}