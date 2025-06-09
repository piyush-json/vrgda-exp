import React from 'react'
import { Card, CardContent, CardFooter } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Avatar } from '~/components/ui/avatar'
import { Progress } from '~/components/ui/progress'
import { ChartContainer } from '~/components/ui/chart'
import { ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { UsersIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { Link } from 'react-router'

interface TokenCardProps {
  token: {
    id: string
    name: string
    symbol: string
    mintAddress: string
    totalSupply: number
    tokensSold: number
    currentPrice: number
    targetPrice: number
    isAuctionActive: boolean
    timeRemaining: number
    launchDate: string
    metadata?: {
      name: string
      uri: string
      metadataPDA: string
    }
  }
  onClick: () => void
}

export function TokenCard({ token, onClick }: TokenCardProps) {
  // Calculate price change (mock for now since we don't have historical data)
  const priceChange24h = ((token.currentPrice - token.targetPrice) / token.targetPrice) * 100
  const isPriceUp = priceChange24h >= 0

  // Generate mock chart data
  const generateChartData = () => {
    const data = []
    const basePrice = token.currentPrice
    for (let i = 0; i < 24; i++) {
      const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
      data.push({
        time: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString(),
        price: basePrice * (1 + variation)
      })
    }
    return data
  }

  const chartData = generateChartData()

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`
    } else {
      return `$${num.toFixed(6)}`
    }
  }

  // Calculate days since launch
  const daysSinceLaunch = Math.floor(
    (new Date().getTime() - new Date(token.launchDate).getTime()) /
    (1000 * 60 * 60 * 24)
  )

  // Calculate market cap (approximate)
  const marketCap = token.currentPrice * token.totalSupply

  // Calculate holders (mock based on tokens sold)
  const holders = Math.floor(token.tokensSold / 1000) + Math.floor(Math.random() * 500)

  return (
    <Card
      className='overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-200 dark:border-gray-800'
      onClick={onClick}
      id='olw858'
    >
      <CardContent className='p-0' id='twj820'>
        <div className='p-6' id='0uhege'>
          <div className='flex justify-between items-start mb-4' id='ssrbhe'>
            <div className='flex items-center space-x-3' id='n1tfum'>
              <Avatar className='h-10 w-10 rounded-full' id='e21j3u'>
                <img
                  src={token.metadata?.uri || '/api/placeholder/40/40'}
                  alt={token.name}
                  className='object-cover'
                  id='37468h'
                />
              </Avatar>
              <div id='zbdgpq'>
                <h3 className='font-bold text-lg' id='31vutd'>
                  {token.name}
                </h3>
                <p
                  className='text-sm text-gray-500 dark:text-gray-400'
                  id='wlgrhu'
                >
                  ${token.symbol}
                </p>
              </div>
            </div>
            <Badge
              variant={isPriceUp ? 'default' : 'destructive'}
              className={`flex items-center ${isPriceUp
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}
              id='7d24ed'
            >
              {isPriceUp ? (
                <TrendingUpIcon className='h-3 w-3 mr-1' id='hh2ya8' />
              ) : (
                <TrendingDownIcon className='h-3 w-3 mr-1' id='pdbjf9' />
              )}
              {Math.abs(priceChange24h).toFixed(2)}%
            </Badge>
          </div>

          <div className='mb-4' id='bza3c5'>
            <div className='flex justify-between items-center mb-1' id='xzk2bk'>
              <span className='text-2xl font-bold' id='q776xc'>
                {formatNumber(token.currentPrice)}
              </span>
              <span
                className='text-sm text-gray-500 dark:text-gray-400'
                id='ngh8zf'
              >
                MCap: {formatNumber(marketCap)}
              </span>
            </div>

            <div className='h-[100px] w-full' id='63zb71'>
              <ChartContainer
                config={{}}
                className='aspect-[none] h-[100px]'
                id='epleav'
              >
                <AreaChart data={chartData} id='bugdkv'>
                  <ChartTooltip content={<ChartTooltipContent id='9jo5mw' />} />

                  <defs id='io5h8z'>
                    <linearGradient
                      id={`gradient-${token.id}`}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor={
                          isPriceUp
                            ? 'hsl(var(--chart-1))'
                            : 'hsl(var(--chart-3))'
                        }
                        stopOpacity={0.8}
                        id='rlwb7l'
                      />

                      <stop
                        offset='95%'
                        stopColor={
                          isPriceUp
                            ? 'hsl(var(--chart-1))'
                            : 'hsl(var(--chart-3))'
                        }
                        stopOpacity={0}
                        id='ze8fqb'
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke='rgba(0,0,0,0.1)'
                    id='mznzrj'
                  />

                  <XAxis
                    dataKey='time'
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    id='nifwu3'
                  />

                  <Area
                    type='monotone'
                    dataKey='price'
                    stroke={
                      isPriceUp ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
                    }
                    fill={`url(#gradient-${token.id})`}
                    strokeWidth={2}
                    id='c9sq1x'
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          <div className='space-y-3' id='itv7qz'>
            <div id='7dsoi3'>
              <div className='flex justify-between text-sm mb-1' id='q6gvn4'>
                <span
                  className='text-gray-500 dark:text-gray-400 flex items-center'
                  id='j4rt04'
                >
                  <UsersIcon className='h-4 w-4 mr-1' id='3vvxb4' />
                  Holders
                </span>
                <span className='font-medium' id='wy5j4o'>
                  {holders.toLocaleString()}
                </span>
              </div>
              <Progress
                value={Math.min((holders / 1000) * 100, 100)}
                className='h-1'
                id='k1te76'
              />
            </div>

            <div className='flex justify-between text-sm' id='2p6kci'>
              <span className='text-gray-500 dark:text-gray-400' id='ujmjlw'>
                Launched
              </span>
              <span className='font-medium' id='trnnw4'>
                {daysSinceLaunch} days ago
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className='bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700'
        id='ekffuv'
      >
        <Button
          asChild
          variant='default'
          className='w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
          id='4jreou'
        >
          <Link to={`/launch-token/${token.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
