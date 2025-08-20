'use client'

import { SessionProvider } from 'next-auth/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'
import { wagmiConfig } from '@/lib/wallet'
import { ThemeProvider } from './ThemeProvider'
import { WalletProvider } from '@/contexts/WalletContext'

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
            <OnchainKitProvider
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              chain={base}
              config={{
                appearance: {
                  mode: 'auto',
                  theme: 'default'
                }
              }}
            >
              <WalletProvider>
                <div className="onchainkit-theme">
                  {children}
                </div>
              </WalletProvider>
            </OnchainKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}