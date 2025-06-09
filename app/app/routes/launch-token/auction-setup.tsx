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

interface AuctionSetupProps {
  formData: any
  priceData: any[]
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSliderChange: (name: string, value: number[]) => void
  handlePrevStep: () => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

const formatSol = (value: number) => {
  if (value < 0.000001) return value.toExponential(4)
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
  handleInputChange,
  handleSliderChange,
  handlePrevStep,
  handleSubmit,
  isLoading
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
        <Alert
          className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        >
          <InfoIcon
            className='h-4 w-4 text-blue-600 dark:text-blue-500'
          />

          <AlertTitle
            className='text-blue-800 dark:text-blue-500'
          >
            About VRGDA
          </AlertTitle>
          <AlertDescription
            className='text-blue-700 dark:text-blue-400'
          >
            VRGDA (Variable Rate Gradual Dutch Auction) is a token
            distribution mechanism that automatically adjusts price based
            on time elapsed and tokens sold, ensuring fair distribution.
          </AlertDescription>
        </Alert>

        <div className='space-y-4'>
          <h3 className='font-medium'>
            Auction Parameters
          </h3>

          <div className='space-y-2' id='token-valuation'>
            <div className='flex items-center'>
              <Label htmlFor='tokenValuation'>
                Token Valuation (FDV in SOL)
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <Input
              id='tokenValuation'
              name='tokenValuation'
              type='number'
              placeholder='e.g., 1000000'
              value={formData.tokenValuation}
              onChange={handleInputChange}
            />

            <p
              className='text-xs text-gray-500 dark:text-gray-400'
            >
              Value in SOL (e.g., 1,000,000 SOL = $100M at $100/SOL)
            </p>
          </div>

          <div className='space-y-2' id='calculated-price'>
            <div className='flex items-center'>
              <Label htmlFor='targetPrice'>
                Calculated Token Price (SOL)
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <div
              className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono'
            >
              {parseFloat(formData.targetPrice) > 0
                ? formatSol(parseFloat(formData.targetPrice))
                : '0.000000000'}{' '}
              SOL
            </div>
            <p
              className='text-xs text-gray-500 dark:text-gray-400'
            >
              This is the starting price of each token in the auction
            </p>
          </div>

          <div className='space-y-2' id='price-decay'>
            <div className='flex items-center'>
              <Label htmlFor='priceDecayPercent'>
                Price Decay Rate (%)
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <Slider
              id='priceDecayPercent'
              min={1}
              max={50}
              step={1}
              value={[parseInt(formData.priceDecayPercent)]}
              onValueChange={(value) =>
                handleSliderChange('priceDecayPercent', value)
              }
            />

            <div
              className='flex justify-between text-xs text-gray-500 dark:text-gray-400'
            >
              <span>Slow (1%)</span>
              <span>{formData.priceDecayPercent}%</span>
              <span>Fast (50%)</span>
            </div>
          </div>

          <div className='space-y-2' id='time-scale'>
            <div className='flex items-center'>
              <Label htmlFor='r'>
                Time Scale Parameter
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <Input
              id='r'
              name='r'
              min={0.01}
              type='number'
              placeholder='e.g., 10000'
              value={formData.r}
              onChange={handleInputChange}
            />

            <p
              className='text-xs text-gray-500 dark:text-gray-400'
            >
              Recommended value: 0.5 - 2.0
            </p>
          </div>

          <div className='space-y-2' id='auction-duration'>
            <div className='flex items-center'>
              <Label htmlFor='auctionDurationDays'>
                Auction Duration (days)
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <Input
              id='auctionDurationDays'
              name='auctionDurationDays'
              type='number'
              placeholder='e.g., 7'
              value={formData.auctionDurationDays}
              onChange={handleInputChange}
              min='1'
              max='30'
            />
          </div>

          <div className='space-y-2' id='reserve-price'>
            <div className='flex items-center'>
              <Label htmlFor='reservePrice'>
                Reserve Price (SOL)
              </Label>
              <HelpCircleIcon
                className='h-4 w-4 ml-2 text-gray-400'
              />
            </div>
            <Input
              id='reservePrice'
              name='reservePrice'
              type='number'
              placeholder='e.g., 0.0001'
              value={formData.reservePrice}
              onChange={handleInputChange}
              min='0.000001'
              step='0.000001'
            />
          </div>

          <div className='mt-6 space-y-2' id='price-curve'>
            <h3 className='font-medium'>
              Price Curve Preview
            </h3>
            <div
              className='w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2'
            >
              <ChartContainer
                config={{}}
                className='aspect-[none] h-[180px]'
              >
                <LineChart data={priceData} >
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />

                  <CartesianGrid
                    vertical={false}
                    stroke='rgba(0,0,0,0.1)'
                  />

                  <XAxis
                    dataKey='day'
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: 'Days',
                      position: 'insideBottom',
                      offset: -5
                    }}
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
                    stroke='red'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
            <p
              className='text-xs text-gray-500 dark:text-gray-400 text-center'
            >
              This chart shows how token price will decrease over time if
              tokens aren't purchased
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='font-medium'>
            Social Links (Optional)
          </h3>

          <div className='space-y-2'>
            <Label htmlFor='website'>
              Website
            </Label>
            <Input
              id='website'
              name='website'
              placeholder='https://yourwebsite.com'
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='twitter'>
              Twitter
            </Label>
            <Input
              id='twitter'
              name='twitter'
              placeholder='https://twitter.com/yourusername'
              value={formData.twitter}
              onChange={handleInputChange}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='telegram'>
              Telegram
            </Label>
            <Input
              id='telegram'
              name='telegram'
              placeholder='https://t.me/yourcommunity'
              value={formData.telegram}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <Alert
          className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        >
          <AlertTriangleIcon
            className='h-4 w-4 text-amber-600 dark:text-amber-500'
          />

          <AlertTitle
            className='text-amber-800 dark:text-amber-500'
          >
            Important
          </AlertTitle>
          <AlertDescription
            className='text-amber-700 dark:text-amber-400'
          >
            Once deployed, auction parameters cannot be changed. Review
            carefully before proceeding.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline' onClick={handlePrevStep}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Launching...' : 'Launch Token'}
        </Button>
      </CardFooter>
    </>
  )
}