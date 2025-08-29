// Contract ABIs for frontend interaction

export const GUI_TOKEN_ABI = [
  // ERC20 Standard Functions
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "account", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {"name": "from", "type": "address"},
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  // Custom GUI Token Functions
  {
    "type": "function",
    "name": "getContractBalance",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  // Events
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {"name": "from", "type": "address", "indexed": true},
      {"name": "to", "type": "address", "indexed": true},
      {"name": "value", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {"name": "owner", "type": "address", "indexed": true},
      {"name": "spender", "type": "address", "indexed": true},
      {"name": "value", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokensMinted",
    "inputs": [
      {"name": "to", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  }
] as const;

export const FARMING_POOL_ABI = [
  // Pool Management Functions
  {
    "type": "function",
    "name": "stake",
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unstake",
    "inputs": [
      {"name": "poolId", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [
      {"name": "poolId", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "emergencyUnstake",
    "inputs": [
      {"name": "poolId", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // View Functions
  {
    "type": "function",
    "name": "calculateRewards",
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "user", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPoolInfo",
    "inputs": [
      {"name": "poolId", "type": "uint256"}
    ],
    "outputs": [
      {"name": "fieldId", "type": "string"},
      {"name": "cropName", "type": "string"},
      {"name": "minStake", "type": "uint256"},
      {"name": "maxStake", "type": "uint256"},
      {"name": "totalStaked", "type": "uint256"},
      {"name": "rewardRate", "type": "uint256"},
      {"name": "lockDuration", "type": "uint256"},
      {"name": "harvestTime", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "riskLevel", "type": "uint8"},
      {"name": "investorsCount", "type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserStake",
    "inputs": [
      {"name": "poolId", "type": "uint256"},
      {"name": "user", "type": "address"}
    ],
    "outputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "unlockTime", "type": "uint256"},
      {"name": "rewardsPaid", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "pendingRewards", "type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalPools",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPools",
    "inputs": [
      {"name": "user", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "guiToken",
    "inputs": [],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  // Events
  {
    "type": "event",
    "name": "Staked",
    "inputs": [
      {"name": "poolId", "type": "uint256", "indexed": true},
      {"name": "user", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unstaked",
    "inputs": [
      {"name": "poolId", "type": "uint256", "indexed": true},
      {"name": "user", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardsPaid",
    "inputs": [
      {"name": "poolId", "type": "uint256", "indexed": true},
      {"name": "user", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EmergencyWithdrawal",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  }
] as const;