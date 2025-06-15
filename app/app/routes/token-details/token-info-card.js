"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenInfoCard = TokenInfoCard;
const card_1 = require("~/components/ui/card");
const separator_1 = require("~/components/ui/separator");
function TokenInfoCard({ mintInfo, tokenId }) {
    var _a;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Token Information</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className='space-y-4'>
        <div>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
            Description
          </h3>
          <p className='text-sm'>
            {((_a = mintInfo.metadata) === null || _a === void 0 ? void 0 : _a.name) || `A VRGDA auction token with ${mintInfo.totalSupply.toLocaleString()} total supply. Built on Solana blockchain with variable rate gradual dutch auction mechanism.`}
          </p>
        </div>

        <separator_1.Separator />

        <div>
          <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
            Token Details
          </h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-sm'>Token Address</span>
              <span className='text-sm font-mono'>{tokenId === null || tokenId === void 0 ? void 0 : tokenId.slice(0, 4)}...{tokenId === null || tokenId === void 0 ? void 0 : tokenId.slice(-4)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Decimals</span>
              <span className='text-sm'>{mintInfo.decimals}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Total Supply</span>
              <span className='text-sm'>{mintInfo.totalSupply.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm'>Target Price</span>
              <span className='text-sm'>{(mintInfo.targetPrice).toFixed(4)} SOL</span>
            </div>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
