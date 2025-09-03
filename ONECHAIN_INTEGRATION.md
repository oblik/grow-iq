# OneChain Integration Documentation

## Overview
This application has been integrated with OneChain (a SUI-based blockchain) for wallet connection and user authentication.

## Features Implemented

### 1. Wallet Connection
- **OneChain Wallet Support**: Connect using OneChain-compatible wallets
- **Balance Display**: Shows OCT (OneChain Token) balance
- **Address Management**: Display and copy wallet addresses

### 2. User Authentication
- **Signature-based Auth**: Authenticate users by signing messages with their OneChain wallet
- **NextAuth Integration**: Seamlessly integrated with existing NextAuth setup
- **Session Management**: Persistent sessions with wallet address stored

### 3. Transaction Support
- **Send Transactions**: Execute transactions on the OneChain network
- **Gas Management**: Automatic gas estimation and payment
- **Transaction Status**: Real-time transaction status updates

## Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Configuration

### Environment Variables
Add these to your `.env.local` file:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# OneChain Network (optional - defaults to devnet)
NEXT_PUBLIC_ONECHAIN_NETWORK=devnet
```

## Usage

### 1. Connect Wallet
Click the "Connect OneChain" button in the header to connect your wallet.

### 2. Authenticate
Once connected, the app will automatically prompt for authentication by signing a message.

### 3. View Demo
Navigate to `/onechain-demo` to see all features in action.

## Key Components

### Wallet Provider
- **File**: `src/contexts/OneChainWalletProvider.tsx`
- **Purpose**: Wraps the app with OneChain wallet context

### Wallet Context
- **File**: `src/contexts/WalletContext.tsx`
- **Purpose**: Manages wallet state and balance

### Authentication Hook
- **File**: `src/hooks/useOneChainAuth.ts`
- **Purpose**: Handles wallet-based authentication

### Wallet Button
- **File**: `src/components/OneChainWalletButton.tsx`
- **Purpose**: UI component for wallet connection

## OneChain API Features

### Network Endpoints
- **Devnet**: `https://rpc-devnet.onelabs.cc:443`
- **Testnet**: `https://rpc-testnet.onelabs.cc:443`
- **Mainnet**: `https://rpc-mainnet.onelabs.cc:443`

### Supported Operations
1. **Wallet Management**
   - Generate new addresses
   - Import/export keypairs
   - Manage multiple accounts

2. **Token Operations**
   - Transfer OCT tokens
   - Check balances
   - Split/merge coins

3. **Smart Contracts**
   - Deploy Move modules
   - Call contract functions
   - Query contract state

4. **Transaction Management**
   - Sign and execute transactions
   - Programmable Transaction Blocks (PTBs)
   - Gas estimation

## Testing

### Get Test Tokens
Use the faucet to get test OCT tokens:
```bash
one client faucet --address YOUR_ADDRESS
```

### Run Test Transaction
Visit `/onechain-demo` and click "Send Test Transaction" to test the integration.

## Security Considerations

1. **Never expose private keys** in your code
2. **Always verify signatures** on the server side
3. **Use environment variables** for sensitive configuration
4. **Implement rate limiting** for transaction endpoints
5. **Validate all user inputs** before processing

## Troubleshooting

### Wallet Not Connecting
- Ensure you have a OneChain-compatible wallet installed
- Check that you're on the correct network (devnet/testnet/mainnet)
- Clear browser cache and reload

### Authentication Failing
- Check NextAuth configuration
- Verify NEXTAUTH_SECRET is set
- Check browser console for specific errors

### Transaction Errors
- Ensure sufficient OCT balance for gas
- Verify transaction parameters
- Check network connectivity

## Resources

- [OneChain Documentation](https://docs.onelabs.cc)
- [SUI SDK Documentation](https://docs.sui.io)
- [Move Language Guide](https://move-language.github.io/move/)

## Support

For issues or questions about the OneChain integration, please refer to:
- OneChain Discord: [Join Community]
- GitHub Issues: [Report Issues]
- Documentation: [Read More]