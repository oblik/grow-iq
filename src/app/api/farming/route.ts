import { NextRequest, NextResponse } from 'next/server'

// Mock farm data structure that matches the real contract data
// In production, this would fetch from the blockchain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('poolId')
    const userAddress = searchParams.get('address')
    
    // For now, return mock data structure that matches contract responses
    // Field F1 (Wheat) is functional, others are "Available Soon"
    const farmData = {
      message: "Live field data with DeFi metrics retrieved successfully.",
      timestamp: new Date().toISOString(),
      fields: [
        {
          field_id: "F1",
          crop_name: "Wheat",
          planting_date: "2025-06-27",
          expected_harvest_date: "2025-10-25",
          days_since_planting: Math.floor((Date.now() - new Date("2025-06-27").getTime()) / (1000 * 60 * 60 * 24)),
          growth_progress_percent: Math.min(Math.floor((Date.now() - new Date("2025-06-27").getTime()) / (1000 * 60 * 60 * 24 * 1.2)), 85),
          soil_moisture_percent: 82,
          temperature_celsius: 34.6,
          humidity_percent: 76,
          timeline_instructions: ["Prepare soil", "Sow seeds", "Irrigate every 10 days", "Harvest when golden"],
          investment_pool: {
            pool_id: 0,
            total_staked: 45000,
            apy_estimate: 12.5,
            min_stake: 100,
            max_stake: 10000,
            investors_count: 23,
            risk_level: "Low" as const,
            liquidity_locked_until: "2025-10-30",
            is_active: true,
            contract_deployed: true // This field is functional
          },
          ai_yield_prediction: {
            estimated_yield_tons: 8.2,
            confidence_score: 87,
            weather_risk_factor: 0.15,
            market_price_estimate: 280
          },
          status: "active" // Fully functional
        },
        {
          field_id: "F2",
          crop_name: "Rice",
          planting_date: "2025-05-28",
          expected_harvest_date: "2025-10-25",
          days_since_planting: 60,
          growth_progress_percent: 40,
          soil_moisture_percent: 84,
          temperature_celsius: 27.1,
          humidity_percent: 94,
          timeline_instructions: ["Flood field", "Transplant seedlings", "Maintain water level", "Harvest when golden"],
          investment_pool: {
            pool_id: 1,
            total_staked: 32000,
            apy_estimate: 15.2,
            min_stake: 50,
            max_stake: 8000,
            investors_count: 18,
            risk_level: "Medium" as const,
            liquidity_locked_until: "2025-10-30",
            is_active: false,
            contract_deployed: false // Available soon
          },
          ai_yield_prediction: {
            estimated_yield_tons: 12.1,
            confidence_score: 92,
            weather_risk_factor: 0.08,
            market_price_estimate: 420
          },
          status: "available_soon" // Available soon
        },
        {
          field_id: "F3",
          crop_name: "Maize",
          planting_date: "2025-07-07",
          expected_harvest_date: "2025-10-05",
          days_since_planting: 20,
          growth_progress_percent: 22,
          soil_moisture_percent: 74,
          temperature_celsius: 33.7,
          humidity_percent: 94,
          timeline_instructions: ["Sow directly", "Weed regularly", "Apply nitrogen", "Harvest when cob hardens"],
          investment_pool: {
            pool_id: 2,
            total_staked: 28500,
            apy_estimate: 18.7,
            min_stake: 75,
            max_stake: 12000,
            investors_count: 15,
            risk_level: "High" as const,
            liquidity_locked_until: "2025-10-10",
            is_active: false,
            contract_deployed: false
          },
          ai_yield_prediction: {
            estimated_yield_tons: 15.3,
            confidence_score: 79,
            weather_risk_factor: 0.22,
            market_price_estimate: 195
          },
          status: "available_soon"
        },
        {
          field_id: "F4",
          crop_name: "Barley",
          planting_date: "2025-06-17",
          expected_harvest_date: "2025-09-25",
          days_since_planting: 40,
          growth_progress_percent: 40,
          soil_moisture_percent: 53,
          temperature_celsius: 24.6,
          humidity_percent: 65,
          timeline_instructions: ["Sow seeds", "Thin out", "Apply fertilizers", "Harvest when heads are full"],
          investment_pool: {
            pool_id: 3,
            total_staked: 15200,
            apy_estimate: 11.8,
            min_stake: 100,
            max_stake: 8000,
            investors_count: 8,
            risk_level: "Low" as const,
            liquidity_locked_until: "2025-09-30",
            is_active: false,
            contract_deployed: false
          },
          ai_yield_prediction: {
            estimated_yield_tons: 6.7,
            confidence_score: 85,
            weather_risk_factor: 0.12,
            market_price_estimate: 245
          },
          status: "available_soon"
        },
        {
          field_id: "F5",
          crop_name: "Soybean",
          planting_date: "2025-06-07",
          expected_harvest_date: "2025-09-25",
          days_since_planting: 50,
          growth_progress_percent: 45,
          soil_moisture_percent: 34,
          temperature_celsius: 18.9,
          humidity_percent: 47,
          timeline_instructions: ["Sow shallow", "Apply phosphorus", "Monitor pest", "Harvest when pods are dry"],
          investment_pool: {
            pool_id: 4,
            total_staked: 38900,
            apy_estimate: 14.3,
            min_stake: 50,
            max_stake: 10000,
            investors_count: 21,
            risk_level: "Medium" as const,
            liquidity_locked_until: "2025-09-30",
            is_active: false,
            contract_deployed: false
          },
          ai_yield_prediction: {
            estimated_yield_tons: 9.4,
            confidence_score: 88,
            weather_risk_factor: 0.18,
            market_price_estimate: 385
          },
          status: "available_soon"
        },
        {
          field_id: "F6",
          crop_name: "Cotton",
          planting_date: "2025-04-28",
          expected_harvest_date: "2025-10-25",
          days_since_planting: 90,
          growth_progress_percent: 50,
          soil_moisture_percent: 63,
          temperature_celsius: 31.0,
          humidity_percent: 54,
          timeline_instructions: ["Sow with spacing", "Spray pesticides", "Prune", "Pick manually"],
          investment_pool: {
            pool_id: 5,
            total_staked: 52000,
            apy_estimate: 16.9,
            min_stake: 200,
            max_stake: 15000,
            investors_count: 31,
            risk_level: "Medium" as const,
            liquidity_locked_until: "2025-10-30",
            is_active: false,
            contract_deployed: false
          },
          ai_yield_prediction: {
            estimated_yield_tons: 4.2,
            confidence_score: 91,
            weather_risk_factor: 0.09,
            market_price_estimate: 1250
          },
          status: "available_soon"
        }
      ]
    }
    
    // If requesting specific pool data
    if (poolId) {
      const pool = farmData.fields.find(f => f.investment_pool.pool_id === parseInt(poolId))
      if (!pool) {
        return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
      }
      return NextResponse.json({ pool, timestamp: farmData.timestamp })
    }
    
    return NextResponse.json(farmData)
    
  } catch (error) {
    console.error('Farming API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farming data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, poolId, userAddress, amount } = body
    
    // Handle different farming actions
    switch (action) {
      case 'stake':
        // In production, this would interact with the smart contract
        return NextResponse.json({
          success: true,
          message: `Staking ${amount} GUI tokens in pool ${poolId}`,
          txHash: '0x' + Math.random().toString(16).substring(2, 66), // Mock tx hash
        })
        
      case 'unstake':
        return NextResponse.json({
          success: true,
          message: `Unstaking from pool ${poolId}`,
          txHash: '0x' + Math.random().toString(16).substring(2, 66),
        })
        
      case 'claim':
        return NextResponse.json({
          success: true,
          message: `Claiming rewards from pool ${poolId}`,
          txHash: '0x' + Math.random().toString(16).substring(2, 66),
        })
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Farming API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process farming action' },
      { status: 500 }
    )
  }
}