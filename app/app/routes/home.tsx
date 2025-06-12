import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  TrendingUpIcon,
  ZapIcon,
  ShieldIcon,
  RocketIcon,
  ArrowRightIcon,
  BarChart3Icon
} from 'lucide-react'
import { Link } from 'react-router'

export default function Home() {
  return (
    <div className='space-y-16'>
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
          <Button size='lg' className='text-lg px-8 py-6' asChild>
            <Link to='/explore' className='flex items-center gap-2'>
              Explore Tokens
              <ArrowRightIcon className='h-5 w-5' />
            </Link>
          </Button>
          <Button size='lg' variant='outline' className='text-lg px-8 py-6' asChild>
            <Link to='/launch-token'>Launch Your Token</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <Card className='text-center'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4'>
              <TrendingUpIcon className='h-6 w-6 text-purple-600' />
            </div>
            <CardTitle>Dynamic Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              VRGDA automatically adjusts token prices based on sales velocity,
              ensuring optimal price discovery and fair distribution.
            </p>
          </CardContent>
        </Card>

        <Card className='text-center'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4'>
              <ZapIcon className='h-6 w-6 text-blue-600' />
            </div>
            <CardTitle>Instant Launch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              Deploy your token in minutes with our streamlined interface.
              No complex setup required - just configure and launch.
            </p>
          </CardContent>
        </Card>

        <Card className='text-center'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4'>
              <ShieldIcon className='h-6 w-6 text-green-600' />
            </div>
            <CardTitle>Secure & Transparent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              Built on Solana with audited smart contracts. All transactions
              are transparent and verifiable on-chain.
            </p>
          </CardContent>
        </Card>
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
              <RocketIcon className='h-8 w-8 text-purple-600' />
            </div>
            <h3 className='text-lg font-semibold'>1. Set Parameters</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Configure target price, decay rate, and time units for your auction
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center'>
              <BarChart3Icon className='h-8 w-8 text-blue-600' />
            </div>
            <h3 className='text-lg font-semibold'>2. Dynamic Pricing</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Prices adjust automatically based on sales velocity vs. target rate
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center'>
              <TrendingUpIcon className='h-8 w-8 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold'>3. Fair Distribution</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Higher demand increases price, lower demand decreases price
            </p>
          </div>

          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center'>
              <ZapIcon className='h-8 w-8 text-orange-600' />
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
          <Button size='lg' variant='secondary' className='text-lg px-8 py-6' asChild>
            <Link to='/launch-token' className='flex items-center gap-2'>
              Launch Your Token
              <RocketIcon className='h-5 w-5' />
            </Link>
          </Button>
          <Button size='lg' variant='outline' className='text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-purple-600' asChild>
            <Link to='/explore'>View All Tokens</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
