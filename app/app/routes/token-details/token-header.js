"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenHeader = TokenHeader;
const avatar_1 = require("~/components/ui/avatar");
const badge_1 = require("~/components/ui/badge");
const button_1 = require("~/components/ui/button");
const lucide_react_1 = require("lucide-react");
function TokenHeader({ tokenId, mintInfo }) {
    var _a, _b, _c;
    return (<div className='flex items-center justify-between gap-2 max-md:flex-col'>
      <div className='flex items-center space-x-4'>
        <avatar_1.Avatar className='h-12 w-12 rounded-full'>
          <img src={((_a = mintInfo.metadata) === null || _a === void 0 ? void 0 : _a.uri) || '/default-token-logo.png'} alt={((_b = mintInfo.metadata) === null || _b === void 0 ? void 0 : _b.name) || mintInfo.symbol} className='object-cover'/>
        </avatar_1.Avatar>
        <div>
          <div className='flex items-center space-x-2'>
            <h1 className='text-xl lg:text-2xl font-bold'>
              {((_c = mintInfo.metadata) === null || _c === void 0 ? void 0 : _c.name) || mintInfo.symbol}
            </h1>
            <badge_1.Badge className='uppercase'>{mintInfo.symbol}</badge_1.Badge>
          </div>
          <div className='flex items-center space-x-2 mt-1'>
            <badge_1.Badge variant='default' className='flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
              <lucide_react_1.InfoIcon className='h-3 w-3 mr-1'/>
              VRGDA Auction
            </badge_1.Badge>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              {mintInfo.isAuctionActive ? 'Active' : 'Ended'}
            </span>
          </div>
        </div>
      </div>
      <div className='flex md:flex-col gap-2'>
        <button_1.Button variant='outline' size='sm' onClick={() => navigator.clipboard.writeText(tokenId || '')}>
          <lucide_react_1.CopyIcon className='h-4 w-4 mr-2'/>
          Copy Address
        </button_1.Button>
        <button_1.Button variant='outline' size='sm' asChild>
          <a href={`https://explorer.solana.com/address/${tokenId}?cluster=devnet`} target='_blank' rel='noopener noreferrer'>
            <lucide_react_1.ExternalLinkIcon className='h-4 w-4 mr-2'/>
            Explorer
          </a>
        </button_1.Button>
      </div>
    </div>);
}
