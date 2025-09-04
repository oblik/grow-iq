'use client'

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import '@mysten/dapp-kit/dist/index.css';

// Create network configuration
// Using Sui RPC as primary, OneChain as fallback
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  localnet: { url: 'http://127.0.0.1:9000' },
});

// Alternative OneChain endpoints (if needed)
const onechainNetworks = {
  devnet: 'https://rpc-devnet.onelabs.cc:443',
  testnet: 'https://rpc-testnet.onelabs.cc:443',
  mainnet: 'https://rpc-mainnet.onelabs.cc:443',
};

export function OneChainWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider autoConnect={true}>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}