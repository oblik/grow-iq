import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";

// === OneChain Testnet Configuration ===
const ONECHAIN_RPC_URL = "https://rpc-testnet.onelabs.cc:443";
const BASE64_SECRET = "suiprivkey1qz4c09hpdrazfafuhk5ttuzwmkeefxuaqeu3wrgqyzcvgn9exvu7q6hfg7w=="; // Replace with your OneChain private key
const RECIPIENT = "0x81a507e8adb7581c9e16ba5269394146ccc1361b3c32357b686d06295bb9ddb5"; // OneChain testnet recipient

// ✅ Get OneChain keypair from base64 secret
function getOnechainKeypair(): Ed25519Keypair {
  const fullBytes = fromB64(BASE64_SECRET);
  
  // Extract the 32-byte seed (OneChain uses same format)
  const seed = fullBytes.slice(0, 32);
  
  return Ed25519Keypair.fromSecretKey(seed);
}

async function transferOnOnechain() {
  const keypair = getOnechainKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log("🔗 OneChain Transfer");
  console.log("✅ Using wallet address:", address);
  console.log("📍 OneChain RPC:", ONECHAIN_RPC_URL);
  
  // Connect to OneChain testnet
  const client = new SuiClient({
    url: ONECHAIN_RPC_URL,
  });
  
  // Fetch owned coins on OneChain
  const coins = await client.getCoins({ owner: address });
  
  if (!coins.data || coins.data.length === 0) {
    console.error("❌ No coins found on OneChain testnet.");
    console.log("💡 Please request tokens from OneChain faucet:");
    console.log("   https://faucet.onelabs.cc");
    return;
  }
  
  console.log(`💰 Found ${coins.data.length} coin(s) on OneChain`);
  console.log("🪙 Coin type:", coins.data[0].coinType);
  
  const balance = coins.data[0].balance;
  console.log("💵 Total Balance:", balance, "MIST");
  
  // Calculate transfer amount (keep some for gas)
  const transferAmount = Math.floor(Number(balance) * 0.1); // Transfer 10% of balance
  const gasReserve = 100000000; // Keep 0.1 OCT for gas
  
  if (transferAmount < 1000) {
    console.error("❌ Balance too low for transfer. Need more than 0.000001 OCT");
    return;
  }
  
  console.log("💸 Transfer Amount:", transferAmount, "MIST");
  
  // Build OneChain transaction
  const tx = new Transaction();
  
  // Split coins from gas for transfer
  const [transferCoin] = tx.splitCoins(tx.gas, [transferAmount]);
  
  // Transfer to recipient
  tx.transferObjects([transferCoin], tx.pure.address(RECIPIENT));
  
  console.log("📤 Sending to:", RECIPIENT);
  
  try {
    // Execute transaction on OneChain
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { 
        showEffects: true, 
        showEvents: true,
        showObjectChanges: true 
      },
    });
    
    console.log("\n✅ OneChain Transaction Successful!");
    console.log("═".repeat(60));
    console.log("📝 Transaction Digest:", result.digest);
    console.log("🔍 View on OneChain Explorer:");
    console.log(`   https://explorer.onelabs.cc/tx/${result.digest}?network=testnet`);
    console.log("═".repeat(60));
    
    if (result.effects?.status?.status === 'success') {
      console.log("✨ Status: SUCCESS");
      console.log("⛽ Gas used:", result.effects.gasUsed?.computationCost);
    }
    
    if (result.events && result.events.length > 0) {
      console.log("\n📊 Events:");
      result.events.forEach((event, i) => {
        console.log(`  ${i + 1}. ${event.type}`);
      });
    }
    
  } catch (err) {
    console.error("\n❌ Error executing OneChain transfer:");
    console.error("Error details:", err);
    
    if (err instanceof Error) {
      if (err.message.includes("insufficient")) {
        console.log("\n💡 Tip: Make sure you have enough balance for gas fees");
      } else if (err.message.includes("network")) {
        console.log("\n💡 Tip: Check your internet connection and OneChain RPC status");
      }
    }
  }
}

// Execute the transfer
console.log("🚀 Starting OneChain Transfer...\n");
transferOnOnechain().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});