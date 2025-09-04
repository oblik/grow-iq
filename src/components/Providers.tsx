'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
      <QueryClientProvider client={queryClient}>
        {/* OneChain Wallet Provider */}
        <OneChainWalletProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </OneChainWalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}