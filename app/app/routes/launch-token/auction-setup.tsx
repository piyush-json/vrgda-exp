import React from 'react'
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Slider } from '~/components/ui/slider'
import { InfoIcon, HelpCircleIcon, AlertTriangleIcon } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart'
import { AlertCircle, Loader2 } from 'lucide-react'

interface AuctionSetupProps {
  formData: any
  priceData: any[]
  validationErrors: { [key: string]: string }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSliderChange: (name: string, value: number[]) => void
  handlePrevStep: () => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  canProceed: boolean
}

const formatSol = (value: number) => {
  if (value == 0) return '0'
  if (value < 0.0001) return value.toFixed(9)
  if (value < 0.01) return value.toFixed(6)
  if (value < 1) return value.toFixed(4)
  return value.toFixed(2)
}

export const CustomToolTip = ({ active, payload, label }: {
  active: boolean
  payload: any[]
  label: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-2 rounded shadow'>
        <p className='label'>{`Day ${label}`}</p>
        <p className='desc'>{`Price: ${formatSol(payload[0].value)} SOL`}</p>
      </div>
    )
  }
  return null
}

export function AuctionSetup({
  formData,
  priceData,
  validationErrors,
  handleInputChange,
  handleSliderChange,
  handlePrevStep,
  handleSubmit,
  isLoading,
  canProceed
}: AuctionSetupProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>VRGDA Auction Setup</CardTitle>
        <CardDescription>
          Configure the Variable Rate Gradual Dutch Auction parameters
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500' />
          <AlertTitle className='text-blue-800 dark:text-blue-500'>About VRGDA</AlertTitle>
          <AlertDescription className='text-blue-700 dark:text-blue-400'>
            VRGDA (Variable Rate Gradual Dutch Auction) is a token distribution mechanism that automatically adjusts price based on time elapsed and tokens sold, ensuring fair distribution.
          </AlertDescription>
        </Alert>

        <div className='space-y-4'>
          <h3 className='font-medium'>Auction Parameters</h3>

          <div className='space-y-2'>
            <div className='flex items-center'>
              <Label htmlFor='tokenValuation' className={validationErrors.tokenValuation ? 'text-red-600 dark:text-red-400' : ''}>
                Token Valuation (FDV in SOL) *
              </Label>
              <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
            </div>
            <Input
              id='tokenValuation'
              name='tokenValuation'
              type='number'
              placeholder='e.g., 4000'
              value={formData.tokenValuation}
              onChange={handleInputChange}
              className={validationErrors.tokenValuation ? 'border-red-300 focus:border-red-500' : ''}
              min="0.001"
              step="0.001"
            />
            {validationErrors.tokenValuation ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.tokenValuation}</AlertDescription>
              </Alert>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Total value of all tokens in SOL (e.g., 4000 SOL = $400K at $100/SOL)
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center'>
              <Label htmlFor='targetPrice'>Calculated Token Price (SOL)</Label>
              <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
            </div>
            <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono text-lg font-semibold text-center'>
              {parseFloat(formData.targetPrice) > 0
                ? formatSol(parseFloat(formData.targetPrice))
                : '0.000000000'}{' '}
              SOL
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
              Starting price per token (Valuation ÷ Supply)
            </p>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center'>
              <Label htmlFor='priceDecayPercent'>Price Decay Rate (%)</Label>
              <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
            </div>
            <Slider
              id='priceDecayPercent'
              min={1}
              max={50}
              step={1}
              value={[parseInt(formData.priceDecayPercent)]}
              onValueChange={(value) => handleSliderChange('priceDecayPercent', value)}
              className="w-full"
            />
            <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
              <span>Slow (1%)</span>
              <span className="font-semibold">{formData.priceDecayPercent}%</span>
              <span>Fast (50%)</span>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              How quickly prices drop when behind schedule
            </p>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center'>
              <Label htmlFor='r' className={validationErrors.r ? 'text-red-600 dark:text-red-400' : ''}>
                Issuance Rate *
              </Label>
              <HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400' />
            </div>
            <Input
              id='r'
              name='r'
              type='number'
              placeholder='e.g., 1'
              value={formData.r}
              onChange={handleInputChange}
              className={validationErrors.r ? 'border-red-300 focus:border-red-500' : ''}
              min="0.01"
              max="100"
              step="0.01"
            />
            {validationErrors.r ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.r}</AlertDescription>
              </Alert>
            ) : (
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Controls auction speed - higher values = faster sales expected
              </p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='auctionDurationDays' className={validationErrors.auctionDurationDays ? 'text-red-600 dark:text-red-400' : ''}>
                Duration (days) *
              </Label>
              <Input
                id='auctionDurationDays'
                name='auctionDurationDays'
                type='number'
                value={formData.auctionDurationDays}
                onChange={handleInputChange}
                className={validationErrors.auctionDurationDays ? 'border-red-300 focus:border-red-500' : ''}
                min='1'
                max='365'
              />
              {validationErrors.auctionDurationDays && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.auctionDurationDays}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reservePrice' className={validationErrors.reservePrice ? 'text-red-600 dark:text-red-400' : ''}>
                Reserve Price (SOL)
              </Label>
              <Input
                id='reservePrice'
                name='reservePrice'
                type='number'
                value={formData.reservePrice}
                onChange={handleInputChange}
                className={validationErrors.reservePrice ? 'border-red-300 focus:border-red-500' : ''}
                min='0'
                step='0.000001'
              />
              {validationErrors.reservePrice && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.reservePrice}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className='mt-6 space-y-2'>
            <h3 className='font-medium'>Price Curve Preview</h3>
            <div className='w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2 min-h-[200px]'>
              {priceData.length > 0 ? (
                <ChartContainer config={{}} className='aspect-[none] h-[180px]'>
                  <LineChart data={priceData}>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <CartesianGrid vertical={false} stroke='rgba(0,0,0,0.1)' />
                    <XAxis
                      dataKey='hours'
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Hours', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${formatSol(value)} SOL`}
                      width={80}
                    />
                    <Line
                      type='monotone'
                      dataKey='price'
                      stroke='black'
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-gray-500">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Generating price curve...</p>
                  </div>
                </div>
              )}
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
              This chart shows how token price will decrease over time if tokens aren't purchased
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='font-medium'>Social Links (Optional)</h3>

          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='website' className={validationErrors.website ? 'text-red-600 dark:text-red-400' : ''}>
                Website
              </Label>
              <Input
                id='website'
                name='website'
                placeholder='https://yourwebsite.com'
                value={formData.website}
                onChange={handleInputChange}
                className={validationErrors.website ? 'border-red-300 focus:border-red-500' : ''}
              />
              {validationErrors.website && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.website}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='twitter' className={validationErrors.twitter ? 'text-red-600 dark:text-red-400' : ''}>
                Twitter
              </Label>
              <Input
                id='twitter'
                name='twitter'
                placeholder='https://twitter.com/yourusername'
                value={formData.twitter}
                onChange={handleInputChange}
                className={validationErrors.twitter ? 'border-red-300 focus:border-red-500' : ''}
              />
              {validationErrors.twitter && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.twitter}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='telegram' className={validationErrors.telegram ? 'text-red-600 dark:text-red-400' : ''}>
                Telegram
              </Label>
              <Input
                id='telegram'
                name='telegram'
                placeholder='https://t.me/yourcommunity'
                value={formData.telegram}
                onChange={handleInputChange}
                className={validationErrors.telegram ? 'border-red-300 focus:border-red-500' : ''}
              />
              {validationErrors.telegram && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.telegram}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
          <AlertTriangleIcon className='h-4 w-4 text-amber-600 dark:text-amber-500' />
          <AlertTitle className='text-amber-800 dark:text-amber-500'>Important</AlertTitle>
          <AlertDescription className='text-amber-700 dark:text-amber-400'>
            Once deployed, auction parameters cannot be changed. Review carefully before proceeding.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline' onClick={handlePrevStep} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !canProceed}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Launching...
            </>
          ) : (
            'Launch Token'
          )}
        </Button>
      </CardFooter>
    </>
  )
}