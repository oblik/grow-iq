# GrowIQ - Infura Migration Guide

This guide explains how to migrate from Coinbase's infrastructure to Infura for blockchain connectivity in the GrowIQ DeFi platform.

## 🔄 Migration Overview

The migration involves:
- ✅ Replacing Coinbase OnchainKit with standard wagmi/viem
- ✅ Switching from Coinbase Wallet SDK to MetaMask + WalletConnect
- ✅ Using Infura RPC endpoints instead of Coinbase infrastructure
- ✅ Updating all wallet connection and transaction components

## 📋 Prerequisites

Before starting, ensure you have:

1. **Infura Account**: Sign up at [infura.io](https://infura.io/)
2. **WalletConnect Project**: Sign up at [cloud.walletconnect.com](https://cloud.walletconnect.com/)
3. **Node.js 18+**: For running the application
4. **Git**: For version control

## 🚀 Setup Instructions

### Step 1: Install Dependencies

The migration has already updated `package.json`. Install the new dependencies:

```bash
# Remove old dependencies and install new ones
npm install

# Or if you prefer yarn
yarn install
```

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your Infura settings in `.env.local`:

```env
# Infura API Key (REQUIRED)
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here

# WalletConnect Project ID (REQUIRED)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_key

# Optional: NextAuth configuration
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Get Your API Keys

#### Infura Setup
1. Visit [infura.io](https://infura.io/) and create an account
2. Create a new project
3. Choose "Web3 API" 
4. Copy your API key from the project dashboard
5. Add to `.env.local` as `NEXT_PUBLIC_INFURA_API_KEY`

#### WalletConnect Setup
1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Create an account and new project
3. Copy the Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Step 4: Test the Migration

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Wallet connection (MetaMask, WalletConnect)
- ✅ Balance display
- ✅ Transaction functionality
- ✅ Network switching

## 🔧 Technical Changes Made

### 1. Package Dependencies

**Removed:**
- `@coinbase/onchainkit`
- `@coinbase/wallet-sdk`

**Added:**
- `@walletconnect/web3-provider`
- `web3` (optional, for additional Web3 utilities)

### 2. Wallet Configuration (`src/lib/wallet.ts`)

**Before (Coinbase):**
```typescript
import { coinbaseWallet } from 'wagmi/connectors'

connectors: [
  coinbaseWallet({
    appName: 'GrowIQ Dashboard',
    appLogoUrl: '/logo.png',
  }),
]

transports: {
  [base.id]: http(),
  [baseSepolia.id]: http(),
}
```

**After (Infura):**
```typescript
import { metaMask, walletConnect, injected } from 'wagmi/connectors'

connectors: [
  metaMask(),
  walletConnect({ projectId }),
  injected(),
]

transports: {
  [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
  [base.id]: http(`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
  // ... more networks
}
```

### 3. Provider Setup (`src/components/Providers.tsx`)

**Before (OnchainKit):**
```typescript
<OnchainKitProvider apiKey={...} chain={base}>
  <WalletProvider>{children}</WalletProvider>
</OnchainKitProvider>
```

**After (Standard Wagmi):**
```typescript
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <WalletProvider>{children}</WalletProvider>
  </QueryClientProvider>
</WagmiProvider>
```

### 4. Transaction Components

- Replaced OnchainKit transaction components with standard wagmi hooks
- Added proper error handling and status tracking
- Improved user experience with detailed transaction states

### 5. Wallet Connection

- Multiple wallet options (MetaMask, WalletConnect, Injected)
- Improved UI with dropdown selection
- Better error handling and connection states

## 🌐 Supported Networks

The migration supports these networks via Infura:

- **Ethereum Mainnet** (`mainnet`)
- **Ethereum Sepolia** (`sepolia`) - Testnet
- **Base** (`base`) - Layer 2
- **Base Sepolia** (`baseSepolia`) - Base Testnet

## 🔍 Troubleshooting

### Common Issues

1. **"Missing Infura API Key" Error**
   ```
   Solution: Check .env.local file and ensure NEXT_PUBLIC_INFURA_API_KEY is set
   ```

2. **WalletConnect Not Working**
   ```
   Solution: Verify NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is correct
   ```

3. **MetaMask Connection Issues**
   ```
   Solution: Ensure MetaMask is installed and unlocked
   ```

4. **Network Not Supported**
   ```
   Solution: Check wallet.ts configuration for supported chains
   ```

### Development Tips

1. **Testing with Testnets**: Use Sepolia or Base Sepolia for testing
2. **Multiple Wallets**: Test with different wallet providers
3. **Network Switching**: Verify automatic network switching works
4. **Transaction Monitoring**: Use Etherscan links for transaction verification

## 📊 Performance Benefits

The migration to Infura provides:

- ✅ **Better Reliability**: Infura's enterprise-grade infrastructure
- ✅ **More Networks**: Support for additional chains
- ✅ **Cost Effective**: Better pricing for API calls
- ✅ **Flexibility**: Use any wallet connector
- ✅ **Independence**: Less vendor lock-in

## 🛡️ Security Considerations

- Keep your Infura API key secure (use environment variables)
- Never commit API keys to version control
- Use different API keys for development/production
- Monitor API usage in Infura dashboard
- Implement rate limiting in production

## 🔗 Useful Resources

- [Infura Documentation](https://docs.infura.io/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

## 🆘 Support

If you encounter issues during migration:

1. Check the environment variables are correctly set
2. Ensure all dependencies are installed
3. Verify network connectivity to Infura
4. Test with different wallet providers

For additional support, refer to the individual service documentation or community forums.

---

**Migration completed successfully! 🎉**

Your GrowIQ platform now runs on Infura infrastructure with enhanced wallet support and better reliability.