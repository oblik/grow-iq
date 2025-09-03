'use client'

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import '@mysten/dapp-kit/dist/index.css';

// Create network configuration
const { networkConfig } = createNetworkConfig({
  devnet: { url: 'https://rpc-devnet.onelabs.cc:443' },
  testnet: { url: 'https://rpc-testnet.onelabs.cc:443' },
  mainnet: { url: 'https://rpc-mainnet.onelabs.cc:443' },
});

export function OneChainWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider autoConnect={true}>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}