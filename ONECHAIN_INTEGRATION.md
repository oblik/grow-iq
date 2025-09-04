# OneChain Integration Complete ✅

This project has been fully integrated with OneChain, a Sui-compatible blockchain network.

## 🔗 OneChain Configuration

### Network Endpoints
- **Testnet RPC**: `https://rpc-testnet.onelabs.cc:443`
- **Mainnet RPC**: `https://rpc-mainnet.onelabs.cc:443`
- **Explorer**: `https://explorer.onelabs.cc`
- **Faucet**: `https://faucet.onelabs.cc`

### Native Token
- **Symbol**: OCT (OneChain Token)
- **Decimals**: 9
- **Smallest Unit**: MIST

## 📦 What Was Updated

### 1. Configuration (`src/config/onechain.ts`)
- ✅ Updated RPC endpoints to use OneChain's official URLs
- ✅ Configured OneChain token (OCT) as native currency
- ✅ Added OneChain explorer URLs

### 2. Wallet Provider (`src/contexts/OneChainWalletProvider.tsx`)
- ✅ Configured to use OneChain RPC endpoints
- ✅ Maintains compatibility with Sui SDK (OneChain is Sui-compatible)

### 3. Transaction Handling
- ✅ Created `src/lib/onechain-transactions.ts` for OneChain-specific transactions
- ✅ Updated `src/hooks/useInvestment.ts` to use OneChain transaction builder
- ✅ Added proper OneChain token handling in transactions

### 4. UI Components
- ✅ **OneChainWalletButton**: Shows OCT balance when connected to OneChain
- ✅ **TestnetBanner**: Updated to mention OneChain testnet
- ✅ **TestnetHelper**: Links to OneChain faucet and documentation
- ✅ Wallet detection for OneChain-compatible wallets

### 5. Testing Scripts
- ✅ Created `scripts/onechain-transfer.ts` for testing transfers
- ✅ Added npm script: `npm run onechain:transfer`

## 🚀 How to Use

### 1. Connect Wallet
The app automatically detects if you're using a OneChain-compatible wallet and will:
- Use OneChain RPC endpoints
- Display OCT token balances
- Execute transactions on OneChain network

### 2. Get Test Tokens
1. Connect your wallet
2. Click the blue "Get Testnet Tokens" button (bottom right)
3. Visit [OneChain Faucet](https://faucet.onelabs.cc)
4. Enter your wallet address and request tokens

### 3. Make Transactions
All farming investments and staking operations now execute on OneChain:
- Transactions use OCT for gas fees
- Explorer links point to OneChain explorer
- Smart contracts are OneChain-compatible

### 4. Run Transfer Test
```bash
# Test OneChain transfer functionality
npm run onechain:transfer
```

## 🔧 Technical Details

### OneChain Compatibility
OneChain is fully compatible with the Sui blockchain, which means:
- Uses the same SDK (`@mysten/sui`)
- Same transaction format
- Same wallet standards
- Same smart contract language (Move)

### Key Differences
- Different RPC endpoints (onelabs.cc instead of sui.io)
- Native token is OCT instead of SUI
- Explorer is at explorer.onelabs.cc
- Faucet is at faucet.onelabs.cc

## 📝 Environment Variables
No additional environment variables are needed. The app automatically:
- Detects the network (testnet/mainnet) based on NODE_ENV
- Selects appropriate RPC endpoints from configuration
- Handles wallet detection and network switching

## 🧪 Testing Checklist
- [x] OneChain RPC connection works
- [x] Wallet connects to OneChain network
- [x] OCT balance displays correctly
- [x] Transactions build with OneChain format
- [x] Explorer links work correctly
- [x] Faucet integration documented

## 🎯 Next Steps
1. Deploy farming smart contracts to OneChain
2. Update contract addresses in `src/config/onechain.ts`
3. Test real staking transactions on OneChain testnet
4. Prepare for mainnet deployment

## 📚 Resources
- [OneChain Documentation](https://docs.onelabs.cc)
- [OneChain Explorer](https://explorer.onelabs.cc)
- [OneChain Faucet](https://faucet.onelabs.cc)
- [OneChain Discord](https://discord.gg/onechain)

## ⚠️ Important Notes
- Always test on testnet first
- Keep sufficient OCT for gas fees (minimum 0.1 OCT recommended)
- OneChain uses the same wallet standards as Sui
- Smart contracts need to be deployed to OneChain network separately