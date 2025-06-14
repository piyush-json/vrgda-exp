import { ChartContainer } from '~/components/ui/chart'
import { ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts'
import { TrendingDownIcon } from 'lucide-react'

interface PriceChartProps {
  auctionData: Array<{ time: number; price: number }>
}

export function PriceChart({ auctionData }: PriceChartProps) {
  if (auctionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5" />
            Price Decay Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No price data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatNumber = (num: number, decimals: number = 4) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const minPrice = Math.min(...auctionData.map(d => d.price))
  const maxPrice = Math.max(...auctionData.map(d => d.price))
  const priceRange = maxPrice - minPrice

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5" />
            VRGDA Price Decay Curve
          </CardTitle>
          <Badge variant="outline">{auctionData.length} Hour Projection</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className=' w-full'>
          <ChartContainer config={{
            price: {
              label: "Price (SOL)",
              color: "#3b82f6",
            }
          }}>
            {/* <ResponsiveContainer width="100%" height="100%"> */}
            <LineChart data={auctionData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.7}
              />
              <XAxis
                dataKey='time'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{
                  value: 'Hours',
                  position: 'insideBottom',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: '#374151', fontWeight: 500 }
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => formatNumber(value, 4)}
                domain={[Math.max(minPrice - (priceRange * 0.1), 0), maxPrice + (priceRange * 0.1)]}
                label={{
                  value: 'Price (SOL)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#374151', fontWeight: 500 }
                }}
              />
              <ChartTooltip
                content={<ChartTooltipContent
                  labelFormatter={(value) => `Hour ${value}`}
                  formatter={(value: any) => [formatNumber(value, 6) + ' SOL']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />}
              />
              <Line
                type='monotone'
                dataKey='price'
                stroke='#3b82f6'
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                fill="url(#priceGradient)"
              />
            </LineChart>
            {/* </ResponsiveContainer> */}
          </ChartContainer>
        </div>
        <div className=" text-sm text-muted-foreground">
          <p>
            This chart shows how the token price will decay over time according to the VRGDA mechanism.
            Actual prices may vary based on purchase activity.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
