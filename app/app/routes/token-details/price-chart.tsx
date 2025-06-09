import { ChartContainer } from '~/components/ui/chart'
import { ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis
} from 'recharts'

interface PriceChartProps {
  auctionData: any[]
}

export function PriceChart({ auctionData }: PriceChartProps) {
  if (auctionData.length === 0) return null

  return (
    <div className='h-[250px] w-full'>
      <h3 className='text-sm font-medium mb-2'>VRGDA Price Curve</h3>
      <ChartContainer config={{}} className='aspect-[none] h-[220px]'>
        <LineChart data={auctionData}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <CartesianGrid vertical={false} stroke='rgba(0,0,0,0.1)' />
          <XAxis
            dataKey='time'
            axisLine={false}
            tickLine={false}
            label={{
              value: 'Time (days)',
              position: 'insideBottom',
              offset: -5
            }}
          />
          <Line
            type='monotone'
            dataKey='price'
            stroke='red'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
