'use client'

import { SessionProvider } from 'next-auth/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wallet'
import { ThemeProvider } from './ThemeProvider'
import { WalletProvider } from '@/contexts/WalletContext'
import { OneChainWalletProvider } from '@/contexts/OneChainWalletProvider'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {/* OneChain Wallet Provider */}
            <OneChainWalletProvider>
              <WalletProvider>
                <div className="wagmi-theme">
                  {children}
                </div>
              </WalletProvider>
            </OneChainWalletProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}