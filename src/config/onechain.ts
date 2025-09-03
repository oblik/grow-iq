import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

// OneChain network configuration
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  devnet: {
    url: 'https://rpc-devnet.onelabs.cc:443',
    variables: {
      myMovePackageId: '0x...',
    },
  },
  testnet: {
    url: 'https://rpc-testnet.onelabs.cc:443',
    variables: {
      myMovePackageId: '0x...',
    },
  },
  mainnet: {
    url: 'https://rpc-mainnet.onelabs.cc:443',
    variables: {
      myMovePackageId: '0x...',
    },
  },
  localnet: {
    url: 'http://127.0.0.1:9000',
    variables: {
      myMovePackageId: '0x...',
    },
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

// Export default network
export const DEFAULT_NETWORK = 'devnet';