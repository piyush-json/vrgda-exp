import { Progress } from '~/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import type { VRGDAInfo } from '~/lib/vrgda/index'

interface AuctionProgressProps {
  tokenInfo: VRGDAInfo
}

export function AuctionProgress({ tokenInfo }: AuctionProgressProps) {
  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  }

  const progressPercentage = (tokenInfo.tokensSold / tokenInfo.totalSupply) * 100
  const remainingTokens = tokenInfo.totalSupply - tokenInfo.tokensSold

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className='text-lg font-semibold'>Sale Progress</h3>
        <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
          {progressPercentage === 100 ? "Complete" : "In Progress"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Tokens Sold</span>
          <span className="font-medium">
            {formatNumber(tokenInfo.tokensSold)} / {formatNumber(tokenInfo.totalSupply)}
          </span>
        </div>

        <div className="relative">
          <Progress
            value={progressPercentage}
            className="h-3"
          />
          <div
            className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>0%</span>
          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          <span>100%</span>
        </div>

        {remainingTokens > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {formatNumber(remainingTokens)} tokens remaining
          </div>
        )}
      </div>
    </div>
  )
}
