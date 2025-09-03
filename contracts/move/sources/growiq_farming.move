module growiq::farming_pool {
    use std::string::{Self, String};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};

    // Error codes
    const EInsufficientBalance: u64 = 1;
    const EPoolNotActive: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const ENotOwner: u64 = 4;
    const EAlreadyHarvested: u64 = 5;
    const ELockPeriodNotMet: u64 = 6;

    // Struct definitions
    public struct FarmingPool has key, store {
        id: UID,
        name: String,
        crop_type: String,
        total_staked: u64,
        apy: u64, // Annual Percentage Yield in basis points (10000 = 100%)
        min_stake: u64,
        lock_period: u64, // in seconds
        is_active: bool,
        owner: address,
        rewards_balance: Balance<OCT>,
        stakers: Table<address, StakeInfo>,
        created_at: u64,
    }

    public struct StakeInfo has store, drop {
        amount: u64,
        staked_at: u64,
        last_harvest: u64,
        rewards_earned: u64,
    }

    public struct OCT has drop {}

    public struct AdminCap has key, store {
        id: UID,
    }

    // Events
    public struct PoolCreated has copy, drop {
        pool_id: ID,
        name: String,
        crop_type: String,
        apy: u64,
    }

    public struct Staked has copy, drop {
        pool_id: ID,
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    public struct Harvested has copy, drop {
        pool_id: ID,
        staker: address,
        rewards: u64,
        timestamp: u64,
    }

    public struct Withdrawn has copy, drop {
        pool_id: ID,
        staker: address,
        amount: u64,
        rewards: u64,
        timestamp: u64,
    }

    // Initialize the module
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // Create a new farming pool
    public entry fun create_pool(
        _admin: &AdminCap,
        name: vector<u8>,
        crop_type: vector<u8>,
        apy: u64,
        min_stake: u64,
        lock_period: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let pool = FarmingPool {
            id: object::new(ctx),
            name: string::utf8(name),
            crop_type: string::utf8(crop_type),
            total_staked: 0,
            apy,
            min_stake,
            lock_period,
            is_active: true,
            owner: tx_context::sender(ctx),
            rewards_balance: balance::zero<OCT>(),
            stakers: table::new(ctx),
            created_at: clock::timestamp_ms(clock),
        };

        event::emit(PoolCreated {
            pool_id: object::id(&pool),
            name: pool.name,
            crop_type: pool.crop_type,
            apy: pool.apy,
        });

        transfer::share_object(pool);
    }

    // Stake OCT tokens in a farming pool
    public entry fun stake(
        pool: &mut FarmingPool,
        payment: Coin<OCT>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(pool.is_active, EPoolNotActive);
        
        let amount = coin::value(&payment);
        assert!(amount >= pool.min_stake, EInvalidAmount);

        let staker = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        // Add to pool's balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut pool.rewards_balance, payment_balance);

        // Update or create stake info
        if (table::contains(&pool.stakers, staker)) {
            let stake_info = table::borrow_mut(&mut pool.stakers, staker);
            stake_info.amount = stake_info.amount + amount;
        } else {
            table::add(&mut pool.stakers, staker, StakeInfo {
                amount,
                staked_at: timestamp,
                last_harvest: timestamp,
                rewards_earned: 0,
            });
        };

        pool.total_staked = pool.total_staked + amount;

        event::emit(Staked {
            pool_id: object::id(pool),
            staker,
            amount,
            timestamp,
        });
    }

    // Calculate rewards for a staker
    public fun calculate_rewards(
        pool: &FarmingPool,
        staker: address,
        clock: &Clock,
    ): u64 {
        if (!table::contains(&pool.stakers, staker)) {
            return 0
        };

        let stake_info = table::borrow(&pool.stakers, staker);
        let current_time = clock::timestamp_ms(clock);
        let time_staked = current_time - stake_info.last_harvest;
        
        // Calculate rewards: (staked_amount * apy * time_staked) / (365 days * 10000)
        let rewards = (stake_info.amount * pool.apy * time_staked) / (365 * 24 * 60 * 60 * 1000 * 10000);
        
        rewards
    }

    // Harvest rewards without withdrawing stake
    public entry fun harvest_rewards(
        pool: &mut FarmingPool,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let staker = tx_context::sender(ctx);
        assert!(table::contains(&pool.stakers, staker), EInvalidAmount);

        let rewards = calculate_rewards(pool, staker, clock);
        assert!(rewards > 0, EAlreadyHarvested);

        let stake_info = table::borrow_mut(&mut pool.stakers, staker);
        stake_info.last_harvest = clock::timestamp_ms(clock);
        stake_info.rewards_earned = stake_info.rewards_earned + rewards;

        // Transfer rewards
        let reward_coin = coin::take(&mut pool.rewards_balance, rewards, ctx);
        transfer::public_transfer(reward_coin, staker);

        event::emit(Harvested {
            pool_id: object::id(pool),
            staker,
            rewards,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Withdraw stake and rewards
    public entry fun withdraw(
        pool: &mut FarmingPool,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let staker = tx_context::sender(ctx);
        assert!(table::contains(&pool.stakers, staker), EInvalidAmount);

        let stake_info = table::borrow(&pool.stakers, staker);
        let current_time = clock::timestamp_ms(clock);
        
        // Check lock period
        assert!(current_time - stake_info.staked_at >= pool.lock_period, ELockPeriodNotMet);

        // Calculate final rewards
        let rewards = calculate_rewards(pool, staker, clock);
        let total_rewards = rewards + stake_info.rewards_earned;

        // Remove staker from pool
        let stake_info = table::remove(&mut pool.stakers, staker);
        let withdraw_amount = stake_info.amount;

        pool.total_staked = pool.total_staked - withdraw_amount;

        // Transfer stake + rewards
        let total_amount = withdraw_amount + total_rewards;
        let withdrawal = coin::take(&mut pool.rewards_balance, total_amount, ctx);
        transfer::public_transfer(withdrawal, staker);

        event::emit(Withdrawn {
            pool_id: object::id(pool),
            staker,
            amount: withdraw_amount,
            rewards: total_rewards,
            timestamp: current_time,
        });
    }

    // Admin function to add rewards to pool
    public entry fun add_rewards(
        _admin: &AdminCap,
        pool: &mut FarmingPool,
        reward_coin: Coin<OCT>,
        _ctx: &mut TxContext,
    ) {
        let reward_balance = coin::into_balance(reward_coin);
        balance::join(&mut pool.rewards_balance, reward_balance);
    }

    // Admin function to toggle pool active status
    public entry fun toggle_pool_status(
        _admin: &AdminCap,
        pool: &mut FarmingPool,
        _ctx: &mut TxContext,
    ) {
        pool.is_active = !pool.is_active;
    }

    // View functions
    public fun get_pool_info(pool: &FarmingPool): (String, String, u64, u64, bool) {
        (pool.name, pool.crop_type, pool.apy, pool.total_staked, pool.is_active)
    }

    public fun get_stake_info(pool: &FarmingPool, staker: address): (u64, u64, u64) {
        if (!table::contains(&pool.stakers, staker)) {
            return (0, 0, 0)
        };
        
        let stake_info = table::borrow(&pool.stakers, staker);
        (stake_info.amount, stake_info.staked_at, stake_info.rewards_earned)
    }

    // Test functions
    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx)
    }
}