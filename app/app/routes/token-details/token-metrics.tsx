import { Card, CardContent } from '~/components/ui/card'
import { DollarSignIcon, CoinsIcon, TrendingUpIcon, ClockIcon } from 'lucide-react'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface TokenMetricsProps {
  tokenInfo: VRGDAInfo
}

export function TokenMetrics({ tokenInfo }: TokenMetricsProps) {
  const formatNumber = (num: number, decimals: number = 6) => {
    if (num < 0.000001) return num.toExponential(2)
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const formatSOL = (lamports: number) => {
    return formatNumber(lamports / 1e9, 4)
  }

  const timeElapsed = Math.floor((Date.now() / 1000) - tokenInfo.startTime)
  const progressPercentage = (tokenInfo.tokensSold / tokenInfo.totalSupply) * 100

  const metrics = [
    {
      label: 'Current Price',
      value: `${formatSOL(tokenInfo.currentPrice)} SOL`,
      icon: DollarSignIcon,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Target Price',
      value: `${formatSOL(tokenInfo.targetPrice)} SOL`,
      icon: TrendingUpIcon,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Progress',
      value: `${progressPercentage.toFixed(1)}%`,
      icon: CoinsIcon,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Time Elapsed',
      value: `${Math.floor(timeElapsed / 86400)}d ${Math.floor((timeElapsed % 86400) / 3600)}h`,
      icon: ClockIcon,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className='p-4'>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className='text-sm text-muted-foreground'>
                    {metric.label}
                  </p>
                  <p className='text-lg font-bold'>
                    {metric.value}
                  </p>
                </div>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
