import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { GUI_TOKEN_ABI, FARMING_POOL_ABI } from './abis'
import contractAddresses from './addresses.json'
import { useChainId } from 'wagmi'
import { Address, parseEther } from 'viem'

// Get contract addresses based on chain ID
export const useContractAddresses = () => {
  const chainId = useChainId()
  const addresses = contractAddresses[chainId.toString() as keyof typeof contractAddresses]
  
  return {
    guiToken: addresses?.GUIToken as Address,
    farmingPool: addresses?.FarmingPool as Address,
    isSupported: !!addresses
  }
}

// GUI Token hooks
export const useGUITokenBalance = (address?: Address) => {
  const { guiToken } = useContractAddresses()
  
  return useReadContract({
    address: guiToken,
    abi: GUI_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!guiToken,
    }
  })
}

export const useGUITokenAllowance = (owner?: Address, spender?: Address) => {
  const { guiToken } = useContractAddresses()
  
  return useReadContract({
    address: guiToken,
    abi: GUI_TOKEN_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender && !!guiToken,
    }
  })
}

export const useGUITokenApprove = () => {
  const { writeContract, ...rest } = useWriteContract()
  const { guiToken } = useContractAddresses()
  
  const approve = (spender: Address, amount: bigint) => {
    return writeContract({
      address: guiToken,
      abi: GUI_TOKEN_ABI,
      functionName: 'approve',
      args: [spender, amount],
    })
  }
  
  return { approve, ...rest }
}

// Farming Pool hooks
export const useFarmingPoolInfo = (poolId?: number) => {
  const { farmingPool } = useContractAddresses()
  
  return useReadContract({
    address: farmingPool,
    abi: FARMING_POOL_ABI,
    functionName: 'getPoolInfo',
    args: poolId !== undefined ? [BigInt(poolId)] : undefined,
    query: {
      enabled: poolId !== undefined && !!farmingPool,
    }
  })
}

export const useUserStake = (poolId?: number, userAddress?: Address) => {
  const { farmingPool } = useContractAddresses()
  
  return useReadContract({
    address: farmingPool,
    abi: FARMING_POOL_ABI,
    functionName: 'getUserStake',
    args: poolId !== undefined && userAddress ? [BigInt(poolId), userAddress] : undefined,
    query: {
      enabled: poolId !== undefined && !!userAddress && !!farmingPool,
    }
  })
}

export const useCalculateRewards = (poolId?: number, userAddress?: Address) => {
  const { farmingPool } = useContractAddresses()
  
  return useReadContract({
    address: farmingPool,
    abi: FARMING_POOL_ABI,
    functionName: 'calculateRewards',
    args: poolId !== undefined && userAddress ? [BigInt(poolId), userAddress] : undefined,
    query: {
      enabled: poolId !== undefined && !!userAddress && !!farmingPool,
    }
  })
}

export const useTotalPools = () => {
  const { farmingPool } = useContractAddresses()
  
  return useReadContract({
    address: farmingPool,
    abi: FARMING_POOL_ABI,
    functionName: 'getTotalPools',
    query: {
      enabled: !!farmingPool,
    }
  })
}

export const useUserPools = (userAddress?: Address) => {
  const { farmingPool } = useContractAddresses()
  
  return useReadContract({
    address: farmingPool,
    abi: FARMING_POOL_ABI,
    functionName: 'getUserPools',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!farmingPool,
    }
  })
}

// Write operations
export const useStakeTokens = () => {
  const { writeContract, ...rest } = useWriteContract()
  const { farmingPool } = useContractAddresses()
  
  const stake = (poolId: number, amount: string) => {
    return writeContract({
      address: farmingPool,
      abi: FARMING_POOL_ABI,
      functionName: 'stake',
      args: [BigInt(poolId), parseEther(amount)],
    })
  }
  
  return { stake, ...rest }
}

export const useUnstakeTokens = () => {
  const { writeContract, ...rest } = useWriteContract()
  const { farmingPool } = useContractAddresses()
  
  const unstake = (poolId: number) => {
    return writeContract({
      address: farmingPool,
      abi: FARMING_POOL_ABI,
      functionName: 'unstake',
      args: [BigInt(poolId)],
    })
  }
  
  return { unstake, ...rest }
}

export const useClaimRewards = () => {
  const { writeContract, ...rest } = useWriteContract()
  const { farmingPool } = useContractAddresses()
  
  const claimRewards = (poolId: number) => {
    return writeContract({
      address: farmingPool,
      abi: FARMING_POOL_ABI,
      functionName: 'claimRewards',
      args: [BigInt(poolId)],
    })
  }
  
  return { claimRewards, ...rest }
}

export const useEmergencyUnstake = () => {
  const { writeContract, ...rest } = useWriteContract()
  const { farmingPool } = useContractAddresses()
  
  const emergencyUnstake = (poolId: number) => {
    return writeContract({
      address: farmingPool,
      abi: FARMING_POOL_ABI,
      functionName: 'emergencyUnstake',
      args: [BigInt(poolId)],
    })
  }
  
  return { emergencyUnstake, ...rest }
}

// Transaction status hook
export const useTransactionStatus = (hash?: `0x${string}`) => {
  return useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    }
  })
}

// Utility types for TypeScript
export type PoolInfo = {
  fieldId: string
  cropName: string
  minStake: bigint
  maxStake: bigint
  totalStaked: bigint
  rewardRate: bigint
  lockDuration: bigint
  harvestTime: bigint
  isActive: boolean
  riskLevel: number
  investorsCount: bigint
}

export type UserStakeInfo = {
  amount: bigint
  timestamp: bigint
  unlockTime: bigint
  rewardsPaid: bigint
  isActive: boolean
  pendingRewards: bigint
}

// Risk level enum mapping
export const RiskLevel = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2
} as const

export const getRiskLevelName = (level: number): string => {
  switch (level) {
    case RiskLevel.LOW: return 'Low'
    case RiskLevel.MEDIUM: return 'Medium'
    case RiskLevel.HIGH: return 'High'
    default: return 'Unknown'
  }
}