'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './ThemeProvider'
import { WalletProvider } from '@/contexts/WalletContext'
import { OneChainWalletProvider } from '@/contexts/OneChainWalletProvider'
import { useMemo } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid stale closures
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), [])

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