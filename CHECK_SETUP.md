# ✅ GrowIQ Testnet Setup Checklist

## Current Status

### ✅ Completed Features:
1. **Wallet Integration**
   - ✅ Sui wallet support
   - ✅ OneChain wallet detection
   - ✅ Automatic network detection
   - ✅ Testnet configuration

2. **Transaction System**
   - ✅ Real testnet transactions enabled
   - ✅ Proper gas calculation
   - ✅ Transaction signing with wallet
   - ✅ Explorer links for transactions

3. **User Interface**
   - ✅ Testnet banner showing network status
   - ✅ Testnet helper button (blue drop icon)
   - ✅ Instructions for getting free tokens
   - ✅ Wallet balance display

4. **Network Configuration**
   - ✅ OneChain testnet RPC
   - ✅ Sui testnet fallback
   - ✅ Automatic network switching

## How to Test Transactions

### Step 1: Start the Application
```bash
npm run dev
```
Open: http://localhost:3002

### Step 2: Get a Wallet
1. Install Sui Wallet: https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil
2. Create new wallet or import
3. **IMPORTANT**: Switch to Testnet in wallet settings

### Step 3: Get Free Testnet Tokens
1. Click the blue water drop button (bottom right)
2. Copy your wallet address
3. Go to: https://faucet.testnet.sui.io/
4. Paste address and get 1 SUI FREE
OR
5. Join Discord: https://discord.gg/sui
6. Go to #testnet-faucet
7. Type: !faucet <your-address>
8. Get 10 SUI FREE

### Step 4: Connect Wallet
1. Click "Connect Wallet" button
2. Select your wallet
3. Approve connection
4. You should see your balance

### Step 5: Make a Transaction
1. Find an "active" farming pool
2. Click "Invest Now"
3. Enter minimum amount (usually 50)
4. Click "Invest Now" in modal
5. **Your wallet will popup**
6. Check gas fee (should be ~0.001 SUI)
7. Click "Approve" in wallet
8. Transaction completes!
9. Click "View Transaction" to see on explorer

## What's Working Now

✅ **Real Testnet Transactions**
- Transactions execute on Sui testnet
- Gas fees are paid with testnet SUI
- Transactions appear on explorer

✅ **Free Test Tokens**
- No real money needed
- Get tokens from faucet
- Perfect for testing

✅ **OneChain Support**
- Detects OneChain wallet
- Shows OCT token symbol
- Uses OneChain RPC when available

## Troubleshooting

### "Insufficient funds" error
→ Get free tokens from faucet
→ Make sure wallet is on TESTNET

### Wallet not connecting
→ Refresh page
→ Check wallet is unlocked
→ Make sure on testnet

### Transaction fails
→ Check you have tokens
→ Keep 0.1 SUI for gas
→ Try smaller amount

### No wallet popup
→ Check popup blocker
→ Refresh and try again
→ Make sure wallet extension enabled

## Important Notes

⚠️ **This is TESTNET**
- Not real money
- Tokens are FREE
- Perfect for testing
- No risk at all

## Support Commands

Check if app is running:
```bash
npm run dev
```

Check wallet network (in browser console):
```javascript
localStorage.getItem('wallet_network')
```

Clear wallet cache:
```javascript
localStorage.clear()
```

## Status Summary

✅ App configured for testnet
✅ Real transactions work
✅ Free tokens available
✅ Safe for testing
✅ No real money needed

**You can now make real testnet transactions!**