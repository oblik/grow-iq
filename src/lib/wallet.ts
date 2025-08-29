import { createConfig, http } from 'wagmi'
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect, injected } from 'wagmi/connectors'

// Infura configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your_walletconnect_project_id'

export const wagmiConfig = createConfig({
  chains: [mainnet, base, sepolia, baseSepolia],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    [base.id]: http(`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    [baseSepolia.id]: http(`https://base-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
  },
})

export const SUPPORTED_CHAINS = [mainnet, base, sepolia, baseSepolia]