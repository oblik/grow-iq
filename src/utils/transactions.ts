// Transaction utilities for GrowIQ agricultural platform

export interface TransactionCall {
  to: `0x${string}`
  value: bigint
  data: `0x${string}`
}

// Example agricultural smart contract addresses on Base
export const CONTRACTS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, // USDC on Base
  WETH: '0x4200000000000000000000000000000000000006' as `0x${string}`, // WETH on Base
  // In production, these would be your agricultural smart contracts
  CROP_STAKING_POOL: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Placeholder
  FARMER_PAYMENTS: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Placeholder
}

// Create a staking transaction for crop investment pools
export function createStakingTransaction(amount: bigint): TransactionCall {
  // This is a demo transaction - in production you'd encode actual staking function calls
  return {
    to: CONTRACTS.WETH,
    value: BigInt('0'),
    data: '0xa9059cbb0000000000000000000000004200000000000000000000000000000000000006000000000000000000000000000000000000000000000000002386f26fc10000' as `0x${string}`,
  }
}

// Create a farmer payment transaction
export function createFarmerPayment(farmerAddress: `0x${string}`, amount: bigint): TransactionCall {
  return {
    to: farmerAddress,
    value: amount,
    data: '0x' as `0x${string}`,
  }
}

// Create USDC transfer for agricultural payments
export function createUSDCPayment(recipient: `0x${string}`, amount: bigint): TransactionCall {
  // ERC20 transfer function signature: transfer(address,uint256)
  const transferSignature = '0xa9059cbb'
  const paddedRecipient = recipient.slice(2).padStart(64, '0')
  const paddedAmount = amount.toString(16).padStart(64, '0')
  
  return {
    to: CONTRACTS.USDC,
    value: BigInt('0'),
    data: `${transferSignature}${paddedRecipient}${paddedAmount}` as `0x${string}`,
  }
}