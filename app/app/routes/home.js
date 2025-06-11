"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const button_1 = require("~/components/ui/button");
const card_1 = require("~/components/ui/card");
const lucide_react_1 = require("lucide-react");
const react_router_1 = require("react-router");
function Home() {
    return (<div className='space-y-16'>
      {/* Hero Section */}
      <div className='text-center space-y-8 py-12'>
        <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent'>
          Kairos
        </h1>
        <p className='text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed'>
          Launch your token with Variable Rate Gradual Dutch Auctions on Solana.
          Dynamic pricing that adapts to demand in real-time.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <button_1.Button size='lg' className='text-lg px-8 py-6' asChild>
            <react_router_1.Link to='/explore' className='flex items-center gap-2'>
              Explore Tokens
              <lucide_react_1.ArrowRightIcon className='h-5 w-5'/>
            </react_router_1.Link>
          </button_1.Button>
          <button_1.Button size='lg' variant='outline' className='text-lg px-8 py-6' asChild>
            <react_router_1.Link to='/launch-token'>Launch Your Token</react_router_1.Link>
          </button_1.Button>
        </div>
      </div>

      {/* Features Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <card_1.Card className='text-center'>
          <card_1.CardHeader>
            <div className='mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4'>
              <lucide_react_1.TrendingUpIcon className='h-6 w-6 text-purple-600'/>
            </div>
            <card_1.CardTitle>Dynamic Pricing</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              VRGDA automatically adjusts token prices based on sales velocity,
              ensuring optimal price discovery and fair distribution.
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className='text-center'>
          <card_1.CardHeader>
            <div className='mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4'>
              <lucide_react_1.ZapIcon className='h-6 w-6 text-blue-600'/>
            </div>
            <card_1.CardTitle>Instant Launch</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              Deploy your token in minutes with our streamlined interface.
              No complex setup required - just configure and launch.
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className='text-center'>
          <card_1.CardHeader>
            <div className='mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4'>
              <lucide_react_1.ShieldIcon className='h-6 w-6 text-green-600'/>
            </div>
            <card_1.CardTitle>Secure & Transparent</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              Built on Solana with audited smart contracts. All transactions
              are transparent and verifiable on-chain.
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* How it Works Section */}
      <div className='space-y-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold mb-4'>How VRGDA Works</h2>
          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Variable Rate Gradual Dutch Auctions create fair and efficient token sales
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center'>
              <lucide_react_1.RocketIcon className='h-8 w-8 text-purple-600'/>
            </div>
            <h3 className='text-lg font-semibold'>1. Set Parameters</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Configure target price, decay rate, and time units for your auction
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center'>
              <lucide_react_1.BarChart3Icon className='h-8 w-8 text-blue-600'/>
            </div>
            <h3 className='text-lg font-semibold'>2. Dynamic Pricing</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Prices adjust automatically based on sales velocity vs. target rate
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
              <lucide_react_1.TrendingUpIcon className='h-8 w-8 text-green-600'/>
            </div>
            <h3 className='text-lg font-semibold'>3. Fair Distribution</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Higher demand increases price, lower demand decreases price
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center'>
              <lucide_react_1.ZapIcon className='h-8 w-8 text-orange-600'/>
            </div>
            <h3 className='text-lg font-semibold'>4. Optimal Sales</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Reach your sales goals with mathematically optimal pricing
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 md:p-12 text-center text-white'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Launch?</h2>
        <p className='text-xl mb-8 opacity-90'>
          Join the future of token distribution on Solana
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button_1.Button size='lg' variant='secondary' className='text-lg px-8 py-6' asChild>
            <react_router_1.Link to='/launch-token' className='flex items-center gap-2'>
              Launch Your Token
              <lucide_react_1.RocketIcon className='h-5 w-5'/>
            </react_router_1.Link>
          </button_1.Button>
          <button_1.Button size='lg' variant='outline' className='text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-purple-600' asChild>
            <react_router_1.Link to='/explore'>View All Tokens</react_router_1.Link>
          </button_1.Button>
        </div>
      </div>
    </div>);
}
