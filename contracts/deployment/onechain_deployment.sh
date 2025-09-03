#!/bin/bash

# OneChain Testnet Deployment Script
echo "=== OneChain Testnet Deployment ==="
echo "Date: $(date)"
echo ""

# Set up environment
export SUI_BIN="$HOME/bin/sui"
export CONTRACT_DIR="/Users/I578432/Documents/GitHub-Personal/grow-iq/contracts/move"

# Display wallet address
echo "Wallet Address:"
echo "0xc88cd6139b32cfe72fbd5a76398edc3424723109e3362a79681add775f9c9ff5"
echo ""

# Build the contract
echo "Building Move contract..."
cd $CONTRACT_DIR
$SUI_BIN move build

# Deploy to OneChain testnet
echo ""
echo "Deploying to OneChain Testnet..."
echo "Network: https://rpc-testnet.onelabs.cc:443"

# Note: For actual deployment, you would use:
# $SUI_BIN client publish --gas-budget 500000000

echo ""
echo "Deployment preparation complete!"
echo "To deploy, ensure you have test tokens and run:"
echo "sui client publish --gas-budget 500000000"