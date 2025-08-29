const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌱 Deploying GrowIQ Smart Contracts...");
  
  // Get the signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy GUI Token
  console.log("\n📦 Deploying GUI Token...");
  const GUIToken = await ethers.getContractFactory("GUIToken");
  const guiToken = await GUIToken.deploy();
  await guiToken.waitForDeployment();
  
  const guiTokenAddress = await guiToken.getAddress();
  console.log("✅ GUI Token deployed to:", guiTokenAddress);

  // Deploy Farming Pool
  console.log("\n📦 Deploying Farming Pool...");
  const FarmingPool = await ethers.getContractFactory("FarmingPool");
  const farmingPool = await FarmingPool.deploy(guiTokenAddress);
  await farmingPool.waitForDeployment();
  
  const farmingPoolAddress = await farmingPool.getAddress();
  console.log("✅ Farming Pool deployed to:", farmingPoolAddress);

  // Create the first farming pool (Wheat - F1)
  console.log("\n🌾 Creating Wheat Farm Pool (F1)...");
  
  const minStake = ethers.parseEther("100"); // 100 GUI minimum
  const maxStake = ethers.parseEther("10000"); // 10,000 GUI maximum per user
  const rewardRate = 1250; // 12.5% APY (in basis points)
  const lockDuration = 120 * 24 * 60 * 60; // 120 days in seconds
  const harvestTime = Math.floor(Date.now() / 1000) + (120 * 24 * 60 * 60); // 120 days from now
  const riskLevel = 0; // LOW risk
  
  const createPoolTx = await farmingPool.createPool(
    "F1",
    "Wheat",
    minStake,
    maxStake,
    rewardRate,
    lockDuration,
    harvestTime,
    riskLevel
  );
  await createPoolTx.wait();
  
  console.log("✅ Wheat farming pool created!");

  // Fund the farming pool contract with GUI tokens for rewards
  console.log("\n💰 Funding farming pool with reward tokens...");
  const rewardFunding = ethers.parseEther("1000000"); // 1M GUI tokens for rewards
  const fundTx = await guiToken.transfer(farmingPoolAddress, rewardFunding);
  await fundTx.wait();
  
  console.log("✅ Farming pool funded with", ethers.formatEther(rewardFunding), "GUI tokens");

  // Get network information
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;

  // Save deployment addresses
  const deploymentInfo = {
    network: networkName,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GUIToken: {
        address: guiTokenAddress,
        name: "GrowIQ Token",
        symbol: "GUI",
        decimals: 18,
        totalSupply: "100000000000000000000000000" // 100M tokens
      },
      FarmingPool: {
        address: farmingPoolAddress,
        name: "GrowIQ Farming Pool",
        guiTokenAddress: guiTokenAddress
      }
    },
    pools: {
      "F1": {
        fieldId: "F1",
        cropName: "Wheat",
        minStake: ethers.formatEther(minStake),
        maxStake: ethers.formatEther(maxStake),
        rewardRate: "12.5%",
        lockDuration: "120 days",
        riskLevel: "LOW"
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Generate contract addresses for frontend
  const contractAddresses: Record<number, any> = {
    [Number(network.chainId)]: {
      GUIToken: guiTokenAddress,
      FarmingPool: farmingPoolAddress
    }
  };

  const addressesFile = path.join(process.cwd(), "src", "contracts", "addresses.json");
  const contractsDir = path.dirname(addressesFile);
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(addressesFile, JSON.stringify(contractAddresses, null, 2));
  console.log("📄 Contract addresses saved to:", addressesFile);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📊 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🏪 Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`🪙 GUI Token: ${guiTokenAddress}`);
  console.log(`🏦 Farming Pool: ${farmingPoolAddress}`);
  console.log(`🌾 Wheat Pool: Created with 12.5% APY`);
  console.log(`💰 Rewards Funded: 1,000,000 GUI tokens`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Verification instructions
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("\n🔍 To verify contracts on Etherscan:");
    console.log(`npx hardhat verify --network ${networkName} ${guiTokenAddress}`);
    console.log(`npx hardhat verify --network ${networkName} ${farmingPoolAddress} ${guiTokenAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });