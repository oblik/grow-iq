# ZKLogin Epoch Synchronization Fix

## Issue Encountered
When attempting to execute transactions on OneChain, users receive the following error:
```
Transaction failed: Invalid user signature: Signature is not valid: 
ZKLogin max epoch too large 849, current epoch 49, max accepted: 79
```

## Root Cause
This error occurs due to epoch number mismatches between different blockchain networks:
- **Sui Testnet**: Current epoch ~49
- **ZKLogin Signature**: Expecting epoch 849
- **Max Accepted**: 79

The ZKLogin authentication system uses epoch numbers to validate signatures, and when there's a significant difference between the network's current epoch and what the signature expects, transactions fail.

## Solution Implemented

### 1. Network Compatibility Mode
The application now defaults to Sui testnet for all transactions to ensure compatibility:
- OneChain integration remains in place but is temporarily disabled
- Users can still connect with any Sui-compatible wallet
- Transactions execute on Sui testnet without epoch issues

### 2. Configuration Changes

#### `src/config/onechain.ts`
- Added environment variable check for OneChain activation
- Defaults to Sui testnet unless explicitly enabled
```typescript
export function getCurrentNetwork() {
  // Default to Sui testnet for compatibility
  if (storedNetwork === 'onechain' && process.env.NEXT_PUBLIC_ENABLE_ONECHAIN === 'true') {
    return 'testnet'; // OneChain
  }
  return 'sui_testnet'; // Default
}
```

#### `src/contexts/OneChainWalletProvider.tsx`
- Conditional RPC endpoint selection based on environment
- Maintains both Sui and OneChain configurations
```typescript
const useOneChain = process.env.NEXT_PUBLIC_ENABLE_ONECHAIN === 'true';
const url = useOneChain ? ONECHAIN_CONFIG.networks.testnet.rpc : getFullnodeUrl('testnet');
```

#### `src/hooks/useInvestment.ts`
- Temporarily disabled OneChain-specific transaction building
- Uses standard Sui transactions for compatibility
```typescript
const isOneChain = false; // Disabled until epoch sync issue is resolved
const tx = new Transaction(); // Standard Sui transaction
```

### 3. Network Switcher Component
Created `src/components/NetworkSwitcher.tsx` to:
- Show current network status
- Allow switching between networks (when enabled)
- Display helpful information about network state
- Provide visual feedback for network selection

### 4. UI Updates
- **TestnetBanner**: Shows current network (Sui/OneChain)
- **TestnetHelper**: Provides correct faucet links based on network
- **OneChainWalletButton**: Displays appropriate token symbol (SUI/OCT)

## How to Enable OneChain

When OneChain's epoch synchronization is resolved, you can enable it by:

1. Create `.env.local` file:
```bash
NEXT_PUBLIC_ENABLE_ONECHAIN=true
```

2. Restart the development server:
```bash
npm run dev
```

3. Use the network switcher (bottom left) to select OneChain

## Current Status

✅ **Working**:
- Sui testnet transactions
- Wallet connections
- Investment operations
- Token displays

⏸️ **Pending OneChain Sync**:
- Direct OneChain transactions
- OneChain-specific features
- OCT token operations

## Testing Transactions

### On Sui Testnet (Current Default):
1. Connect any Sui-compatible wallet
2. Get test SUI from: https://faucet.testnet.sui.io/
3. Make investments normally
4. Transactions execute on Sui testnet

### On OneChain (When Enabled):
1. Set `NEXT_PUBLIC_ENABLE_ONECHAIN=true`
2. Connect OneChain-compatible wallet
3. Get test OCT from: https://faucet.onelabs.cc
4. Switch network using NetworkSwitcher
5. Transactions execute on OneChain testnet

## Technical Details

### Why This Happens
1. **Epoch Numbers**: Each blockchain maintains its own epoch counter
2. **ZKLogin**: Uses epochs for signature validation
3. **Cross-Network**: Signatures from one network may not be valid on another
4. **Time-based**: Epochs increment over time, causing drift between networks

### Long-term Solutions
1. **Epoch Synchronization**: OneChain could sync epoch numbers with Sui
2. **Signature Adaptation**: Implement signature translation between networks
3. **Separate Authentication**: Use network-specific authentication methods
4. **Bridge Service**: Create a service to handle cross-network authentication

## Monitoring

To check current epoch numbers:
```typescript
// Sui Testnet
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
const epoch = await suiClient.getLatestSuiSystemState();
console.log('Sui Epoch:', epoch.epoch);

// OneChain Testnet
const onechainClient = new SuiClient({ url: 'https://rpc-testnet.onelabs.cc:443' });
const onechainEpoch = await onechainClient.getLatestSuiSystemState();
console.log('OneChain Epoch:', onechainEpoch.epoch);
```

## User Impact

### Minimal Disruption
- Users can continue using the app normally
- All features work on Sui testnet
- OneChain branding remains visible
- Easy switch when OneChain is ready

### Clear Communication
- Network status shown in UI
- TestnetBanner indicates current network
- NetworkSwitcher provides control
- Error messages are informative

## Next Steps

1. **Monitor OneChain Updates**: Check for epoch synchronization fixes
2. **Test Periodically**: Try enabling OneChain to check if issue is resolved
3. **User Communication**: Inform users when OneChain is fully available
4. **Gradual Migration**: Move features to OneChain as stability improves

## Support

For issues or questions:
- Check network status in NetworkSwitcher
- Verify wallet is connected to correct network
- Ensure you have testnet tokens for current network
- Report issues with network/epoch information