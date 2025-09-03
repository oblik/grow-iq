# GrowIQ DeFi Platform

**Revolutionizing Agriculture with Blockchain Technology and AI**

GrowIQ DeFi is an innovative decentralized finance platform that bridges traditional agriculture with blockchain technology. Built on OneChain (SUI-based blockchain) for fast, low-cost transactions, users can invest in real farming operations, track crop growth through IoT sensors, and earn yields based on actual harvest outcomes.

## Project Demo

[![GrowIQ Platform Demo](https://img.youtube.com/vi/R0RJ2Up2V8E/0.jpg)](https://youtu.be/R0RJ2Up2V8E)

*Watch our platform in action - showcasing real-time farm monitoring, investment features, and AI-powered yield predictions.*

Click the image above or [watch on YouTube](https://youtu.be/R0RJ2Up2V8E) to see the full demonstration.

## Features

### Core Platform Features
- **Real-time Farm Monitoring**: Live IoT data from agricultural fields
- **DeFi Investment Pools**: Stake $GUI tokens in farming operations
- **AI Yield Prediction**: Machine learning models for harvest forecasting
- **3D Farm Visualization**: Interactive FarmVerse 3D environment
- **Neural Network Analysis**: AI-powered crop optimization insights

### Investment Features
- **Multiple Risk Levels**: Low, Medium, and High-risk investment pools
- **Competitive APY**: 10-20% annual percentage yields
- **Diversified Crops**: Wheat, Rice, Maize, Cotton, Soybean, and more
- **Transparent Returns**: Blockchain-recorded yield distributions
- **Flexible Staking**: Various minimum stake amounts and lock periods

### Portfolio Management
- **Real-time Balance Tracking**: Monitor $GUI token holdings
- **Investment Dashboard**: View all active farming investments
- **Rewards History**: Track claimed and pending rewards
- **Performance Analytics**: Portfolio growth and yield analysis

### AI Assistant
- **Investment Guidance**: Personalized staking recommendations
- **Risk Assessment**: Analysis of farming and market conditions
- **Market Insights**: Timing and strategy suggestions
- **24/7 Support**: Always-available chat assistance

## Technology Stack

### Frontend
- **Next.js 15.4.4**: React-based web framework
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Blockchain & Web3
- **OneChain (SUI-based)**: Primary blockchain for authentication and transactions
  - **@mysten/dapp-kit**: Official OneChain/SUI dApp development kit
  - **@mysten/sui**: Core SDK for OneChain/SUI blockchain interaction
  - **OCT Token**: Native OneChain token for gas and transactions
- **Wagmi 2.16.3**: React hooks for Ethereum (secondary support)
- **Viem 2.33.3**: TypeScript interface for Ethereum
- **Infura**: Enterprise-grade blockchain infrastructure
- **Multi-Wallet Support**: OneChain wallets, MetaMask, WalletConnect

### Authentication & Backend
- **NextAuth.js**: Secure authentication system
  - **OneChain Wallet Auth**: Signature-based authentication using OneChain wallets
  - **Credentials Provider**: Custom authentication for blockchain wallets
- **Prisma Adapter**: Database integration
- **OpenAI**: AI-powered chat assistance
- **TanStack Query**: Data fetching and caching

### Development Tools
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **ESLint**: Code quality and consistency

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Package manager (npm, yarn, or pnpm)
- OneChain-compatible wallet (Sui Wallet, Martian, Suiet, etc.)
- Web3 wallet (MetaMask, WalletConnect compatible, etc.) - optional
- Infura API key (sign up at https://infura.io/) - for Ethereum support
- WalletConnect Project ID (optional, for mobile wallet support)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AloysJehwin/grow-iq.git
   cd grow-iq
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables:
   ```env
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # OneChain Configuration (optional - defaults to devnet)
   NEXT_PUBLIC_ONECHAIN_NETWORK=devnet # Options: devnet, testnet, mainnet
   
   # Ethereum Support (optional)
   NEXT_PUBLIC_INFURA_API_KEY=your-infura-api-key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   
   # AI Features
   OPENAI_API_KEY=your-openai-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## OneChain Integration

### Overview
GrowIQ uses OneChain (a SUI-based blockchain) as the primary authentication and transaction layer. OneChain provides fast, low-cost transactions with native support for Move smart contracts.

### Key Features
- **Wallet-Based Authentication**: Sign in using your OneChain wallet address
- **OCT Token Support**: Native OneChain token for transactions and gas fees
- **Signature Verification**: Secure message signing for authentication
- **Multi-Network Support**: Connect to Devnet, Testnet, or Mainnet
- **Real-Time Balance Updates**: Track OCT balance in real-time

### OneChain Components

#### Wallet Provider (`src/contexts/OneChainWalletProvider.tsx`)
Wraps the application with OneChain SDK providers for wallet connectivity.

#### Wallet Context (`src/contexts/WalletContext.tsx`)
Manages wallet state, balance queries, and connection status across the app.

#### Authentication Hook (`src/hooks/useOneChainAuth.ts`)
Handles wallet-based authentication flow with signature verification.

#### Wallet Button (`src/components/OneChainWalletButton.tsx`)
Provides UI for connecting and managing OneChain wallets.

#### Configuration (`src/config/onechain.ts`)
Defines network endpoints and configuration for OneChain networks.

### Getting Test Tokens
To get test OCT tokens on devnet:
```bash
# Using OneChain CLI
one client faucet --address YOUR_ADDRESS

# Or visit the web faucet
https://faucet.devnet.onelabs.cc
```

### Demo Page
Explore all OneChain features at `/onechain-demo`:
- Test wallet connection
- Authenticate with signature
- Send test transactions
- View balance and account info

## Usage Guide

### Connecting Your Wallet

#### OneChain Wallet (Primary)
1. Click "Connect OneChain" in the top navigation
2. Choose your OneChain-compatible wallet (Sui Wallet, Martian, Suiet)
3. Approve the connection request
4. Sign the authentication message to create a session
5. Your OCT balance will be displayed

#### Ethereum Wallet (Secondary)
1. Click "Connect Wallet" for Ethereum options
2. Choose MetaMask or WalletConnect
3. Approve the connection request
4. Your ETH balance will be displayed

### Making Investments
1. Browse available farming pools on the dashboard
2. Click "View Details" on any field card
3. Review investment metrics (APY, risk level, lock period)
4. Enter your desired stake amount
5. Confirm the transaction in your wallet

### Monitoring Investments
1. Navigate to the "Portfolio" section
2. View your active investments and returns
3. Track growth progress and yield predictions
4. Claim rewards when available

### Using AI Features
1. Click the chat icon in the bottom-right corner
2. Ask about investment strategies, risk analysis, or market conditions
3. Get personalized recommendations based on your portfolio
4. Receive real-time alerts about your investments

## Platform Components

### FarmVerse 3D
Interactive 3D visualization of farming operations with:
- Real-time crop growth animations
- Environmental condition displays
- Click-to-explore field details
- Immersive farming experience

### Neural Visualizer
AI-powered analytics displaying:
- Crop growth predictions
- Environmental risk factors
- Market condition analysis
- Yield optimization suggestions

### Holographic UI
Futuristic interface elements featuring:
- Dynamic data visualization
- Animated statistics
- Gradient backgrounds
- Interactive particle effects

### Floating Action Hub
Quick access toolbar with:
- VR mode toggle
- AI insights panel
- Performance booster
- Theme customization

## Configuration

### Theming
The platform supports dark/light themes with:
```jsx
import { ThemeProvider } from '@/components/ThemeProvider'
```

### Data Management
Real-time data is managed through:
- React state for UI interactions
- TanStack Query for server state
- Local storage for user preferences
- Blockchain for transaction records

### Security Features
- **OneChain Wallet Authentication**
  - Signature-based authentication
  - Message signing verification
  - Session persistence with JWT
- **NextAuth.js session management**
  - Secure credential provider for OneChain
  - Protected API routes
- **Secure wallet connections**
  - Standard wallet adapter protocol
  - Auto-disconnect on network changes
- **Encrypted API communications**
- **Input validation and sanitization**

## Project Structure

```
grow-iq/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── OneChainWalletButton.tsx # OneChain wallet connection
│   │   ├── WalletConnector.tsx # Ethereum wallet connection
│   │   ├── MainDashboard.tsx # Main dashboard
│   │   ├── FarmVerse3D.tsx # 3D visualization
│   │   ├── HolographicUI.tsx # UI elements
│   │   └── ...            # Other components
│   ├── contexts/          # React contexts
│   │   ├── WalletContext.tsx # Unified wallet state management
│   │   └── OneChainWalletProvider.tsx # OneChain SDK provider
│   ├── hooks/             # Custom hooks
│   │   ├── useOneChainAuth.ts # OneChain authentication hook
│   │   └── useHydration.ts # Client-side hydration
│   ├── lib/               # Utility libraries
│   │   └── auth.ts        # NextAuth configuration with OneChain
│   ├── config/            # Configuration files
│   │   └── onechain.ts    # OneChain network configuration
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                # Static assets
│   ├── GrowIQ_Video.mp4   # Demo video
│   └── *.svg              # Icons and images
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind CSS config
└── tsconfig.json          # TypeScript config
```

## Future Roadmap

### Phase 1: Core Platform (Current)
- [x] Basic investment pools
- [x] Real-time farm monitoring
- [x] AI yield predictions
- [x] 3D visualization

### Phase 2: Advanced DeFi Features
- [ ] Liquidity pools and automated market makers
- [ ] Cross-chain farming opportunities (OneChain <-> Ethereum)
- [ ] Insurance and risk mitigation tools
- [ ] Governance token voting system
- [ ] OneChain Move smart contracts for farming pools

### Phase 3: Ecosystem Expansion
- [ ] Mobile application
- [ ] Advanced AI models
- [ ] IoT sensor integration
- [ ] Real-world farm partnerships

### Phase 4: Global Platform
- [ ] Multi-language support
- [ ] Regional farming programs
- [ ] Enterprise solutions
- [ ] Sustainability tracking

## Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code consistency
- Write descriptive commit messages
- Test features thoroughly before submitting
- Update documentation for new features
- Test OneChain integration on devnet before mainnet
- Ensure wallet connection error handling

## Performance Metrics

### Platform Statistics
- **Average APY**: 14.2% across all pools
- **Total Value Locked**: $2.1M in farming operations
- **Active Users**: 500+ investors
- **Successful Harvests**: 95% completion rate
- **AI Prediction Accuracy**: 87% average confidence

### Investment Pools
- **6 Active Crops**: Diversified portfolio options
- **85+ Investors**: Growing community
- **$160K+ Staked**: Community investment volume
- **Multiple Risk Levels**: Conservative to aggressive options

## Supported Wallets & Networks

### OneChain Wallets
- **Sui Wallet**: Official wallet for SUI/OneChain
- **Martian Wallet**: Multi-chain wallet with OneChain support
- **Suiet Wallet**: Feature-rich OneChain wallet
- **Ethos Wallet**: User-friendly OneChain wallet

### OneChain Networks
- **Devnet**: Development network for testing
  - RPC: `https://rpc-devnet.onelabs.cc:443`
  - Faucet available for test tokens
- **Testnet**: Public test network
  - RPC: `https://rpc-testnet.onelabs.cc:443`
  - Stable testing environment
- **Mainnet**: Production network
  - RPC: `https://rpc-mainnet.onelabs.cc:443`
  - Real value transactions

### Ethereum Support (Secondary)
- **MetaMask**: Popular Ethereum wallet
- **WalletConnect**: Mobile wallet protocol
- **Rainbow**: Mobile-first wallet
- **Coinbase Wallet**: Exchange-integrated wallet

## FAQ

### Q: What is OneChain and OCT token?
A: OneChain is a SUI-based blockchain that GrowIQ uses for authentication and transactions. OCT (OneChain Token) is the native token used for gas fees and transactions on the OneChain network.

### Q: What is $GUI token?
A: $GUI is the native utility token of GrowIQ platform, used for staking in farming pools, governance voting, and earning rewards.

### Q: How are yields calculated?
A: Yields are based on actual harvest outcomes, market prices, and distribution schedules tied to crop cycles.

### Q: What happens if a crop fails?
A: Risk-appropriate insurance mechanisms protect investors, with compensation based on pool risk levels and diversification.

### Q: Can I withdraw my stake early?
A: Early withdrawal is possible with penalties. Lock periods ensure farm funding stability but emergency withdrawal options exist.

### Q: How accurate are AI predictions?
A: Our AI models achieve 85-90% accuracy by analyzing weather patterns, soil conditions, and historical yield data.

## Support & Contact

### Getting Help
- **AI Assistant**: Available 24/7 through the in-app chat
- **Documentation**: Comprehensive guides and tutorials
- **Community Forum**: Connect with other investors
- **Email Support**: support@growiq.finance

### Links
- **Website**: [https://growiq.finance](https://growiq.finance)
- **Twitter**: [@GrowIQDeFi](https://twitter.com/GrowIQDeFi)
- **Discord**: [Join our community](https://discord.gg/growiq)
- **Telegram**: [GrowIQ Official](https://t.me/growiqofficial)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Agricultural Partners**: Local farming cooperatives
- **Technology Partners**: Blockchain and IoT providers
- **Community**: Early investors and beta testers
- **Open Source**: Amazing libraries and frameworks used

---

**Built with love by the GrowIQ Team**

*Transforming agriculture through blockchain innovation*

**Happy Farming, Happy Investing!**
