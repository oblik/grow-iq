'use client'

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

// Create network configuration
const { networkConfig } = createNetworkConfig({
  devnet: { url: 'https://rpc-devnet.onelabs.cc:443' },
  testnet: { url: 'https://rpc-testnet.onelabs.cc:443' },
  mainnet: { url: 'https://rpc-mainnet.onelabs.cc:443' },
});

const queryClient = new QueryClient();

export function OneChainWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider autoConnect={true}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}