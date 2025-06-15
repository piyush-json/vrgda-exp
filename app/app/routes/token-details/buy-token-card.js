"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyTokenCard = BuyTokenCard;
const card_1 = require("~/components/ui/card");
const button_1 = require("~/components/ui/button");
const input_1 = require("~/components/ui/input");
const label_1 = require("~/components/ui/label");
const alert_1 = require("~/components/ui/alert");
const separator_1 = require("~/components/ui/separator");
const lucide_react_1 = require("lucide-react");
function BuyTokenCard({ mintInfo, buyAmount, setBuyAmount, currentTotalAmount, onBuyClick }) {
    if (!mintInfo.isAuctionActive)
        return null;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Participate in VRGDA Auction</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className='space-y-4'>
          <alert_1.Alert className='bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'>
            <lucide_react_1.AlertTriangleIcon className='h-4 w-4 text-amber-600 dark:text-amber-500'/>
            <alert_1.AlertTitle className='text-amber-800 dark:text-amber-500'>
              Current Price
            </alert_1.AlertTitle>
            <alert_1.AlertDescription className='text-amber-700 dark:text-amber-400'>
              {(mintInfo.currentPrice).toFixed(6)} SOL per token. Price decreases over time until all tokens are sold.
            </alert_1.AlertDescription>
          </alert_1.Alert>

          <div className='space-y-2'>
            <label_1.Label htmlFor='buyAmount'>Amount to Buy</label_1.Label>
            <input_1.Input id='buyAmount' type='number' placeholder='Enter amount of tokens' value={buyAmount} min={1} max={Math.min(mintInfo.totalSupply - mintInfo.tokensSold, 100)} onChange={(e) => setBuyAmount(e.target.value)}/>
          </div>

          <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
            <div className='flex justify-between mb-2'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Price per Token:
              </span>
              <span className='font-medium'>
                {(mintInfo.currentPrice).toFixed(6)} SOL
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Quantity:
              </span>
              <span className='font-medium'>
                {buyAmount ? parseInt(buyAmount).toLocaleString() : '0'} tokens
              </span>
            </div>
            <separator_1.Separator className='my-2'/>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>Total Cost:</span>
              <span className='font-bold'>
                {buyAmount ? currentTotalAmount : '0'} SOL
              </span>
            </div>
          </div>

          <button_1.Button className='w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600' onClick={onBuyClick} disabled={!buyAmount || parseInt(buyAmount) <= 0}>
            Buy Tokens
          </button_1.Button>

          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            VRGDA auctions automatically adjust price based on time and demand.
            <br />
            Buy early for potentially better prices.
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
