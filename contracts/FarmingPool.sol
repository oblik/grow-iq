// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FarmingPool
 * @dev Smart contract for agricultural investment staking pools
 * Users can stake GUI tokens and earn rewards based on farming outcomes
 */
contract FarmingPool is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable guiToken;
    
    // Pool information
    struct Pool {
        string fieldId;           // Field identifier (e.g., "F1")
        string cropName;          // Crop name (e.g., "Wheat")
        uint256 minStake;         // Minimum stake amount
        uint256 maxStake;         // Maximum stake per user
        uint256 totalStaked;      // Total amount staked in pool
        uint256 rewardRate;       // Annual reward rate (basis points, e.g., 1250 = 12.5%)
        uint256 lockDuration;     // Lock duration in seconds
        uint256 harvestTime;      // Expected harvest timestamp
        bool isActive;            // Pool status
        RiskLevel riskLevel;      // Risk level enum
        uint256 totalRewards;     // Total rewards distributed
        uint256 investorsCount;   // Number of unique investors
    }
    
    // Risk levels
    enum RiskLevel { LOW, MEDIUM, HIGH }
    
    // Stake information for each user
    struct Stake {
        uint256 amount;           // Staked amount
        uint256 timestamp;        // Stake timestamp
        uint256 unlockTime;       // When tokens can be withdrawn
        uint256 rewardsPaid;      // Rewards already paid out
        bool isActive;            // Stake status
    }
    
    // Events
    event PoolCreated(uint256 indexed poolId, string fieldId, string cropName);
    event Staked(uint256 indexed poolId, address indexed user, uint256 amount);
    event Unstaked(uint256 indexed poolId, address indexed user, uint256 amount);
    event RewardsPaid(uint256 indexed poolId, address indexed user, uint256 amount);
    event PoolStatusChanged(uint256 indexed poolId, bool isActive);
    event HarvestCompleted(uint256 indexed poolId, uint256 totalYield);
    event EmergencyWithdrawal(address indexed user, uint256 amount);
    
    // State variables
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    mapping(uint256 => address[]) public poolInvestors;
    mapping(address => uint256[]) public userPools;
    
    uint256 public poolCount;
    uint256 public constant BASIS_POINTS = 10000; // 100%
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    // Pool management
    mapping(uint256 => bool) public poolExists;
    
    modifier poolExistsModifier(uint256 poolId) {
        require(poolExists[poolId], "FarmingPool: Pool does not exist");
        _;
    }
    
    modifier poolActive(uint256 poolId) {
        require(pools[poolId].isActive, "FarmingPool: Pool is not active");
        _;
    }
    
    constructor(address _guiToken) Ownable(msg.sender) {
        require(_guiToken != address(0), "FarmingPool: Invalid token address");
        guiToken = IERC20(_guiToken);
    }
    
    /**
     * @dev Create a new farming pool
     */
    function createPool(
        string memory _fieldId,
        string memory _cropName,
        uint256 _minStake,
        uint256 _maxStake,
        uint256 _rewardRate,
        uint256 _lockDuration,
        uint256 _harvestTime,
        RiskLevel _riskLevel
    ) external onlyOwner {
        require(bytes(_fieldId).length > 0, "FarmingPool: Field ID required");
        require(bytes(_cropName).length > 0, "FarmingPool: Crop name required");
        require(_minStake > 0, "FarmingPool: Min stake must be positive");
        require(_maxStake >= _minStake, "FarmingPool: Max stake must be >= min stake");
        require(_rewardRate <= 5000, "FarmingPool: Reward rate too high"); // Max 50% APY
        require(_harvestTime > block.timestamp, "FarmingPool: Harvest time must be in future");
        
        uint256 poolId = poolCount++;
        
        pools[poolId] = Pool({
            fieldId: _fieldId,
            cropName: _cropName,
            minStake: _minStake,
            maxStake: _maxStake,
            totalStaked: 0,
            rewardRate: _rewardRate,
            lockDuration: _lockDuration,
            harvestTime: _harvestTime,
            isActive: true,
            riskLevel: _riskLevel,
            totalRewards: 0,
            investorsCount: 0
        });
        
        poolExists[poolId] = true;
        
        emit PoolCreated(poolId, _fieldId, _cropName);
    }
    
    /**
     * @dev Stake tokens in a farming pool
     */
    function stake(uint256 poolId, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        poolExistsModifier(poolId) 
        poolActive(poolId) 
    {
        Pool storage pool = pools[poolId];
        Stake storage userStake = stakes[poolId][msg.sender];
        
        require(amount >= pool.minStake, "FarmingPool: Amount below minimum stake");
        require(userStake.amount + amount <= pool.maxStake, "FarmingPool: Exceeds maximum stake");
        require(block.timestamp < pool.harvestTime, "FarmingPool: Staking period ended");
        
        // Transfer tokens from user to contract
        guiToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        if (userStake.amount == 0) {
            // New staker
            poolInvestors[poolId].push(msg.sender);
            userPools[msg.sender].push(poolId);
            pool.investorsCount++;
            
            userStake.timestamp = block.timestamp;
            userStake.unlockTime = block.timestamp + pool.lockDuration;
            userStake.isActive = true;
        }
        
        userStake.amount += amount;
        pool.totalStaked += amount;
        
        emit Staked(poolId, msg.sender, amount);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     */
    function calculateRewards(uint256 poolId, address user) 
        public 
        view 
        returns (uint256) 
    {
        Pool storage pool = pools[poolId];
        Stake storage userStake = stakes[poolId][user];
        
        if (userStake.amount == 0 || !userStake.isActive) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 annualReward = (userStake.amount * pool.rewardRate) / BASIS_POINTS;
        uint256 reward = (annualReward * stakingDuration) / SECONDS_PER_YEAR;
        
        return reward > userStake.rewardsPaid ? reward - userStake.rewardsPaid : 0;
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards(uint256 poolId) 
        external 
        nonReentrant 
        whenNotPaused 
        poolExistsModifier(poolId) 
    {
        uint256 pendingRewards = calculateRewards(poolId, msg.sender);
        require(pendingRewards > 0, "FarmingPool: No rewards to claim");
        
        stakes[poolId][msg.sender].rewardsPaid += pendingRewards;
        pools[poolId].totalRewards += pendingRewards;
        
        guiToken.safeTransfer(msg.sender, pendingRewards);
        
        emit RewardsPaid(poolId, msg.sender, pendingRewards);
    }
    
    /**
     * @dev Unstake tokens after lock period
     */
    function unstake(uint256 poolId) 
        external 
        nonReentrant 
        whenNotPaused 
        poolExistsModifier(poolId) 
    {
        Stake storage userStake = stakes[poolId][msg.sender];
        Pool storage pool = pools[poolId];
        
        require(userStake.isActive, "FarmingPool: No active stake");
        require(block.timestamp >= userStake.unlockTime, "FarmingPool: Tokens still locked");
        
        uint256 stakedAmount = userStake.amount;
        uint256 pendingRewards = calculateRewards(poolId, msg.sender);
        
        // Update state
        userStake.isActive = false;
        pool.totalStaked -= stakedAmount;
        
        if (pendingRewards > 0) {
            userStake.rewardsPaid += pendingRewards;
            pool.totalRewards += pendingRewards;
        }
        
        // Transfer tokens back to user
        guiToken.safeTransfer(msg.sender, stakedAmount + pendingRewards);
        
        emit Unstaked(poolId, msg.sender, stakedAmount);
        if (pendingRewards > 0) {
            emit RewardsPaid(poolId, msg.sender, pendingRewards);
        }
    }
    
    /**
     * @dev Emergency unstake (may have penalties)
     */
    function emergencyUnstake(uint256 poolId) 
        external 
        nonReentrant 
        poolExistsModifier(poolId) 
    {
        Stake storage userStake = stakes[poolId][msg.sender];
        require(userStake.isActive, "FarmingPool: No active stake");
        
        uint256 stakedAmount = userStake.amount;
        uint256 penalty = (stakedAmount * 500) / BASIS_POINTS; // 5% penalty
        uint256 returnAmount = stakedAmount - penalty;
        
        // Update state
        userStake.isActive = false;
        pools[poolId].totalStaked -= stakedAmount;
        
        guiToken.safeTransfer(msg.sender, returnAmount);
        // Penalty stays in contract as additional rewards
        
        emit EmergencyWithdrawal(msg.sender, returnAmount);
    }
    
    /**
     * @dev Complete harvest and distribute final rewards
     */
    function completeHarvest(uint256 poolId, uint256 actualYield) 
        external 
        onlyOwner 
        poolExistsModifier(poolId) 
    {
        Pool storage pool = pools[poolId];
        require(block.timestamp >= pool.harvestTime, "FarmingPool: Harvest time not reached");
        
        pool.isActive = false;
        
        // Additional yield-based rewards can be distributed here
        // based on actualYield parameter
        
        emit HarvestCompleted(poolId, actualYield);
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo(uint256 poolId) 
        external 
        view 
        poolExistsModifier(poolId) 
        returns (
            string memory fieldId,
            string memory cropName,
            uint256 minStake,
            uint256 maxStake,
            uint256 totalStaked,
            uint256 rewardRate,
            uint256 lockDuration,
            uint256 harvestTime,
            bool isActive,
            RiskLevel riskLevel,
            uint256 investorsCount
        ) 
    {
        Pool storage pool = pools[poolId];
        return (
            pool.fieldId,
            pool.cropName,
            pool.minStake,
            pool.maxStake,
            pool.totalStaked,
            pool.rewardRate,
            pool.lockDuration,
            pool.harvestTime,
            pool.isActive,
            pool.riskLevel,
            pool.investorsCount
        );
    }
    
    /**
     * @dev Get user stake information
     */
    function getUserStake(uint256 poolId, address user) 
        external 
        view 
        returns (
            uint256 amount,
            uint256 timestamp,
            uint256 unlockTime,
            uint256 rewardsPaid,
            bool isActive,
            uint256 pendingRewards
        ) 
    {
        Stake storage userStake = stakes[poolId][user];
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.unlockTime,
            userStake.rewardsPaid,
            userStake.isActive,
            calculateRewards(poolId, user)
        );
    }
    
    /**
     * @dev Pause contract - emergency function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update pool status
     */
    function setPoolStatus(uint256 poolId, bool _isActive) 
        external 
        onlyOwner 
        poolExistsModifier(poolId) 
    {
        pools[poolId].isActive = _isActive;
        emit PoolStatusChanged(poolId, _isActive);
    }
    
    /**
     * @dev Get total pools count
     */
    function getTotalPools() external view returns (uint256) {
        return poolCount;
    }
    
    /**
     * @dev Get user's pool IDs
     */
    function getUserPools(address user) external view returns (uint256[] memory) {
        return userPools[user];
    }
    
    /**
     * @dev Get pool investors
     */
    function getPoolInvestors(uint256 poolId) 
        external 
        view 
        poolExistsModifier(poolId) 
        returns (address[] memory) 
    {
        return poolInvestors[poolId];
    }
}