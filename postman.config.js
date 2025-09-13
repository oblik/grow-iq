module.exports = {
  collection: {
    id: '774506e7-3cdc-42c3-9be0-f3c8d0ddfdf0',
    name: 'GrowIQ API Collection',
    description: 'Complete API collection for GrowIQ Dashboard - Agricultural IoT and DeFi Platform',
  },
  apiKey: process.env.NEXT_PUBLIC_POSTMAN_API,
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  watchPaths: [
    'src/app/api/**/*.{js,ts,jsx,tsx}',
    'src/pages/api/**/*.{js,ts,jsx,tsx}'
  ],
  variables: [
    {
      key: 'base_url',
      value: 'http://localhost:3000',
      type: 'string',
      description: 'Base URL for the GrowIQ API'
    },
    {
      key: 'openai_api_key',
      value: '',
      type: 'string',
      description: 'OpenAI API Key for chat functionality'
    },
    {
      key: 'user_address',
      value: '0x1234567890abcdef',
      type: 'string',
      description: 'User wallet address for blockchain interactions'
    },
    {
      key: 'pool_id',
      value: '0',
      type: 'string',
      description: 'Default pool ID for farming operations'
    },
    {
      key: 'stake_amount',
      value: '1000',
      type: 'string',
      description: 'Default stake amount in GUI tokens'
    },
    {
      key: 'field_id',
      value: 'F1',
      type: 'string',
      description: 'Default field ID for queries'
    }
  ]
};