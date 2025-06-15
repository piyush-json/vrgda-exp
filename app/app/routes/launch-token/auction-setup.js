"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomToolTip = void 0;
exports.AuctionSetup = AuctionSetup;
const react_1 = __importDefault(require("react"));
const card_1 = require("~/components/ui/card");
const alert_1 = require("~/components/ui/alert");
const input_1 = require("~/components/ui/input");
const button_1 = require("~/components/ui/button");
const label_1 = require("~/components/ui/label");
const slider_1 = require("~/components/ui/slider");
const lucide_react_1 = require("lucide-react");
const recharts_1 = require("recharts");
const chart_1 = require("~/components/ui/chart");
const formatSol = (value) => {
    if (value < 0.000001)
        return value.toExponential(4);
    if (value < 0.0001)
        return value.toFixed(9);
    if (value < 0.01)
        return value.toFixed(6);
    if (value < 1)
        return value.toFixed(4);
    return value.toFixed(2);
};
const CustomToolTip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (<div className='bg-white p-2 rounded shadow'>
        <p className='label'>{`Day ${label}`}</p>
        <p className='desc'>{`Price: ${formatSol(payload[0].value)} SOL`}</p>
      </div>);
    }
    return null;
};
exports.CustomToolTip = CustomToolTip;
function AuctionSetup({ formData, priceData, handleInputChange, handleSliderChange, handlePrevStep, handleSubmit, isLoading }) {
    return (<>
      <card_1.CardHeader>
        <card_1.CardTitle>VRGDA Auction Setup</card_1.CardTitle>
        <card_1.CardDescription>
          Configure the Variable Rate Gradual Dutch Auction parameters
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className='space-y-6'>
        <alert_1.Alert className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
          <lucide_react_1.InfoIcon className='h-4 w-4 text-blue-600 dark:text-blue-500'/>

          <alert_1.AlertTitle className='text-blue-800 dark:text-blue-500'>
            About VRGDA
          </alert_1.AlertTitle>
          <alert_1.AlertDescription className='text-blue-700 dark:text-blue-400'>
            VRGDA (Variable Rate Gradual Dutch Auction) is a token
            distribution mechanism that automatically adjusts price based
            on time elapsed and tokens sold, ensuring fair distribution.
          </alert_1.AlertDescription>
        </alert_1.Alert>

        <div className='space-y-4'>
          <h3 className='font-medium'>
            Auction Parameters
          </h3>

          <div className='space-y-2' id='token-valuation'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='tokenValuation'>
                Token Valuation (FDV in SOL)
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <input_1.Input id='tokenValuation' name='tokenValuation' type='number' placeholder='e.g., 1000000' value={formData.tokenValuation} onChange={handleInputChange}/>

            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Value in SOL (e.g., 1,000,000 SOL = $100M at $100/SOL)
            </p>
          </div>

          <div className='space-y-2' id='calculated-price'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='targetPrice'>
                Calculated Token Price (SOL)
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono'>
              {parseFloat(formData.targetPrice) > 0
            ? formatSol(parseFloat(formData.targetPrice))
            : '0.000000000'}{' '}
              SOL
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              This is the starting price of each token in the auction
            </p>
          </div>

          <div className='space-y-2' id='price-decay'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='priceDecayPercent'>
                Price Decay Rate (%)
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <slider_1.Slider id='priceDecayPercent' min={1} max={50} step={1} value={[parseInt(formData.priceDecayPercent)]} onValueChange={(value) => handleSliderChange('priceDecayPercent', value)}/>

            <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400'>
              <span>Slow (1%)</span>
              <span>{formData.priceDecayPercent}%</span>
              <span>Fast (50%)</span>
            </div>
          </div>

          <div className='space-y-2' id='time-scale'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='r'>
                Time Scale Parameter
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <input_1.Input id='r' name='r' min={0.01} type='number' placeholder='e.g., 10000' value={formData.r} onChange={handleInputChange}/>

            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Recommended value: 0.5 - 2.0
            </p>
          </div>

          <div className='space-y-2' id='auction-duration'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='auctionDurationDays'>
                Auction Duration (days)
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <input_1.Input id='auctionDurationDays' name='auctionDurationDays' type='number' placeholder='e.g., 7' value={formData.auctionDurationDays} onChange={handleInputChange} min='1' max='30'/>
          </div>

          <div className='space-y-2' id='reserve-price'>
            <div className='flex items-center'>
              <label_1.Label htmlFor='reservePrice'>
                Reserve Price (SOL)
              </label_1.Label>
              <lucide_react_1.HelpCircleIcon className='h-4 w-4 ml-2 text-gray-400'/>
            </div>
            <input_1.Input id='reservePrice' name='reservePrice' type='number' placeholder='e.g., 0.0001' value={formData.reservePrice} onChange={handleInputChange} min='0.000001' step='0.000001'/>
          </div>

          <div className='mt-6 space-y-2' id='price-curve'>
            <h3 className='font-medium'>
              Price Curve Preview
            </h3>
            <div className='w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2'>
              <chart_1.ChartContainer config={{}} className='aspect-[none] h-[180px]'>
                <recharts_1.LineChart data={priceData}>
                  <chart_1.ChartTooltip content={<chart_1.ChartTooltipContent />}/>

                  <recharts_1.CartesianGrid vertical={false} stroke='rgba(0,0,0,0.1)'/>

                  <recharts_1.XAxis dataKey='day' axisLine={false} tickLine={false} label={{
            value: 'Days',
            position: 'insideBottom',
            offset: -5
        }}/>

                  <recharts_1.YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${formatSol(value)} SOL`} width={80}/>

                  <recharts_1.Line type='monotone' dataKey='price' stroke='red' strokeWidth={2} dot={false}/>
                </recharts_1.LineChart>
              </chart_1.ChartContainer>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
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
            <label_1.Label htmlFor='website'>
              Website
            </label_1.Label>
            <input_1.Input id='website' name='website' placeholder='https://yourwebsite.com' value={formData.website} onChange={handleInputChange}/>
          </div>

          <div className='space-y-2'>
            <label_1.Label htmlFor='twitter'>
              Twitter
            </label_1.Label>
            <input_1.Input id='twitter' name='twitter' placeholder='https://twitter.com/yourusername' value={formData.twitter} onChange={handleInputChange}/>
          </div>

          <div className='space-y-2'>
            <label_1.Label htmlFor='telegram'>
              Telegram
            </label_1.Label>
            <input_1.Input id='telegram' name='telegram' placeholder='https://t.me/yourcommunity' value={formData.telegram} onChange={handleInputChange}/>
          </div>
        </div>

        <alert_1.Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
          <lucide_react_1.AlertTriangleIcon className='h-4 w-4 text-amber-600 dark:text-amber-500'/>

          <alert_1.AlertTitle className='text-amber-800 dark:text-amber-500'>
            Important
          </alert_1.AlertTitle>
          <alert_1.AlertDescription className='text-amber-700 dark:text-amber-400'>
            Once deployed, auction parameters cannot be changed. Review
            carefully before proceeding.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </card_1.CardContent>
      <card_1.CardFooter className='flex justify-between'>
        <button_1.Button variant='outline' onClick={handlePrevStep}>
          Back
        </button_1.Button>
        <button_1.Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Launching...' : 'Launch Token'}
        </button_1.Button>
      </card_1.CardFooter>
    </>);
}
