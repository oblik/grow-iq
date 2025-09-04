// OneChain Network Configuration
export const ONECHAIN_CONFIG = {
  // Network endpoints
  networks: {
    mainnet: {
      rpc: 'https://rpc.onechain.network',
      explorer: 'https://explorer.onechain.network',
      chainId: 'onechain:mainnet',
    },
    testnet: {
      rpc: 'https://rpc-testnet.onechain.network',
      explorer: 'https://explorer-testnet.onechain.network',
      chainId: 'onechain:testnet',
    },
    // Fallback to Sui testnet for development
    sui_testnet: {
      rpc: 'https://fullnode.testnet.sui.io:443',
      explorer: 'https://suiscan.xyz/testnet',
      chainId: 'sui:testnet',
    },
  },

  // Token configuration
  tokens: {
    native: {
      symbol: 'OCT',
      name: 'OneChain Token',
      decimals: 9,
    },
    gui: {
      symbol: 'GUI',
      name: 'GrowIQ Token',
      decimals: 9,
      // Contract address will be updated after deployment
      contractAddress: '0x...',
    },
  },

  // Farming contract addresses (to be updated after deployment)
  contracts: {
    farming: {
      packageId: '0x...',
      module: 'farming_pool',
      adminCap: '0x...',
    },
    staking: {
      packageId: '0x...',
      module: 'staking_pool',
      adminCap: '0x...',
    },
  },

  // Transaction settings
  transaction: {
    defaultGasLimit: 100000000, // 0.1 OCT/SUI
    maxGasLimit: 1000000000, // 1 OCT/SUI
  },

  // Wallet detection
  walletDetection: {
    onechain: ['onechain', 'one chain', 'onechain wallet'],
    supportedWallets: ['OneChain Wallet', 'Sui Wallet', 'Suiet', 'Martian'],
  },
};

// Helper function to get current network
export function getCurrentNetwork(): 'mainnet' | 'testnet' | 'sui_testnet' {
  if (typeof window === 'undefined') return 'sui_testnet';
  
  const storedNetwork = window.localStorage?.getItem('wallet_network');
  if (storedNetwork === 'onechain') {
    return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
  }
  
  return 'sui_testnet';
}

// Helper function to get RPC URL
export function getRpcUrl(): string {
  const network = getCurrentNetwork();
  return ONECHAIN_CONFIG.networks[network].rpc;
}

// Helper function to get explorer URL
export function getExplorerUrl(txHash: string): string {
  const network = getCurrentNetwork();
  const baseUrl = ONECHAIN_CONFIG.networks[network].explorer;
  return `${baseUrl}/tx/${txHash}`;
}

// Helper function to detect if wallet is OneChain
export function isOneChainWallet(walletName?: string): boolean {
  if (!walletName) return false;
  
  const lowerName = walletName.toLowerCase();
  return ONECHAIN_CONFIG.walletDetection.onechain.some(name => 
    lowerName.includes(name)
  );
}

// Helper function to format token amount
export function formatTokenAmount(amount: number, isOneChain: boolean): string {
  const symbol = isOneChain ? ONECHAIN_CONFIG.tokens.native.symbol : 'SUI';
  return `${amount.toLocaleString()} ${symbol}`;
}