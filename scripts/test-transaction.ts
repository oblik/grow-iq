import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

// OneChain Testnet Configuration
const ONECHAIN_TESTNET_RPC = 'https://rpc-testnet.onelabs.cc:443';
const FARMING_CONTRACT = {
  packageId: '0xTEST_PACKAGE_ID_FOR_DEMO',
  poolId: 'pool_wheat_01',
};

async function createTestTransaction() {
  console.log('Creating test transaction for OneChain Testnet...\n');
  
  // Create client
  const client = new SuiClient({ url: ONECHAIN_TESTNET_RPC });
  
  // Create transaction
  const tx = new Transaction();
  
  // Add a simple transfer for demonstration
  const amountInMist = 0.001 * 1e9; // 0.001 SUI
  const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
  
  // Add a move call to our farming contract (simulated)
  tx.moveCall({
    target: `${FARMING_CONTRACT.packageId}::farming_pool::stake`,
    arguments: [
      tx.object(FARMING_CONTRACT.poolId),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  // Generate a demo transaction digest
  // In production, this would come from signing and executing the transaction
  const demoDigest = 'HjKLMN89aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789ABC';
  
  console.log('='.repeat(60));
  console.log('ONECHAIN TESTNET TRANSACTION DEMO');
  console.log('='.repeat(60));
  console.log('Network: OneChain Testnet');
  console.log('RPC Endpoint:', ONECHAIN_TESTNET_RPC);
  console.log('Contract Package:', FARMING_CONTRACT.packageId);
  console.log('Pool ID:', FARMING_CONTRACT.poolId);
  console.log('Transaction Type: Stake in Farming Pool');
  console.log('Amount: 0.001 SUI');
  console.log('');
  console.log('Transaction Digest:', demoDigest);
  console.log('Explorer URL:', `https://explorer.onelabs.cc/tx/${demoDigest}?network=testnet`);
  console.log('');
  console.log('Status: Demo (Ready for actual execution with wallet)');
  console.log('='.repeat(60));
  console.log('\nTo execute a real transaction:');
  console.log('1. Connect your OneChain wallet');
  console.log('2. Ensure you have test tokens');
  console.log('3. Click "Invest Now" on any active wheat field');
  console.log('4. Follow the investment flow in the UI');
  
  return demoDigest;
}

// Run if called directly
if (require.main === module) {
  createTestTransaction().catch(console.error);
}

export { createTestTransaction };