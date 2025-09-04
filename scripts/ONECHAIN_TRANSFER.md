# OneChain Transfer Script

This script demonstrates how to perform transfers on the OneChain testnet.

## Configuration

The script uses the OneChain testnet RPC endpoint:
- **RPC URL**: `https://rpc-testnet.onelabs.cc:443`

## Prerequisites

1. **OneChain Wallet**: You need a OneChain-compatible wallet with testnet tokens
2. **Private Key**: Replace the `BASE64_SECRET` in the script with your actual OneChain private key
3. **Testnet Tokens**: Get free testnet tokens from [OneChain Faucet](https://faucet.onelabs.cc)

## Usage

Run the transfer script:

```bash
npm run onechain:transfer
```

Or directly with tsx:

```bash
npx tsx scripts/onechain-transfer.ts
```

## Features

- ✅ Connects to OneChain testnet RPC
- ✅ Uses OneChain-compatible transaction format
- ✅ Handles Ed25519 keypair for OneChain
- ✅ Provides detailed transaction feedback
- ✅ Shows OneChain explorer links for transactions

## Transaction Flow

1. **Connect to OneChain**: Establishes connection to `https://rpc-testnet.onelabs.cc:443`
2. **Load Wallet**: Derives wallet address from private key
3. **Check Balance**: Fetches available coins on OneChain
4. **Build Transaction**: Creates transfer transaction
5. **Sign & Execute**: Signs with private key and broadcasts to OneChain
6. **Verify**: Provides transaction digest and explorer link

## Error Handling

The script includes handling for common issues:
- No coins available (directs to faucet)
- Insufficient balance for gas
- Network connectivity issues
- Invalid private key format

## Security Note

⚠️ **NEVER** share your private key or commit it to version control. Always use environment variables or secure key management in production.

## OneChain Explorer

View your transactions on OneChain Explorer:
- Pattern: `https://explorer.onelabs.cc/tx/{DIGEST}?network=testnet`