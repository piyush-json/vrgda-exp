"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCard = void 0;
exports.default = Explore;
const react_1 = require("react");
const input_1 = require("~/components/ui/input");
const button_1 = require("~/components/ui/button");
const card_1 = require("~/components/ui/card");
const avatar_1 = require("~/components/ui/avatar");
const lucide_react_1 = require("lucide-react");
const use_all_tokens_1 = require("~/hooks/use-all-tokens");
const react_router_1 = require("react-router");
const web3_js_1 = require("@solana/web3.js");
const TokenCard = ({ token, onClick }) => {
    return (<card_1.Card className='overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border-gray-200 dark:border-gray-800' onClick={onClick} id='olw858'>
      <card_1.CardContent className='p-0' id='twj820'>
        <div className='p-6' id='0uhege'>
          <div className='flex items-center space-x-3 mb-4' id='n1tfum'>
            <avatar_1.Avatar className='h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center' id='e21j3u'>
              <lucide_react_1.CoinsIcon className='h-6 w-6 text-white'/>
            </avatar_1.Avatar>
            <div className='flex-1' id='zbdgpq'>
              <h3 className='font-bold text-lg mb-1' id='31vutd'>
                {token.symbol || 'Token'}
              </h3>
              <p className='text-[11px] text-gray-500 dark:text-gray-400 font-mono break-all' id='wlgrhu'>
                {token.mintAddress}
              </p>
            </div>
          </div>

          <div className='space-y-3 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4' id='bza3c5'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <p className='text-gray-500 dark:text-gray-400'>Reserve Price</p>
                <p className='font-semibold'>{parseInt(token.reservePrice) / web3_js_1.LAMPORTS_PER_SOL}</p>
              </div>
              <div>
                <p className='text-gray-500 dark:text-gray-400'>Total Supply</p>
                <p className='font-semibold'>{token.totalSupply}</p>
              </div>
              <div>
                <p className='text-gray-500 dark:text-gray-400'>Tokens Sold</p>
                <p className='font-semibold'>{token.tokensSold || 0}</p>
              </div>
              <div>
                <p className='text-gray-500 dark:text-gray-400'>Duration (days)</p>
                <p className='font-semibold'>{token.auctionDurationDays}</p>
              </div>
            </div>
            <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Decay Constant</p>
              <p className='text-sm font-mono'>{token.decayConstant}</p>
            </div>
          </div>
        </div>
      </card_1.CardContent>

      <card_1.CardFooter className='bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700' id='ekffuv'>
        <button_1.Button asChild variant='default' className='w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600' id='4jreou'>
          <react_router_1.Link to={`/token/${token.vrgda}`}>View Details</react_router_1.Link>
        </button_1.Button>
      </card_1.CardFooter>
    </card_1.Card>);
};
exports.TokenCard = TokenCard;
function Explore() {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const navigate = (0, react_router_1.useNavigate)();
    const { tokens, allTokens, currentPage, totalPages, isLoading, error, refreshTokens, goToPage } = (0, use_all_tokens_1.useAllTokens)();
    const filteredTokens = (0, react_1.useMemo)(() => {
        if (!searchQuery)
            return tokens;
        return allTokens.filter(token => token.mintAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [tokens, allTokens, searchQuery]);
    const handleTokenClick = (token) => {
        navigate((0, react_router_1.href)('/token/:id', {
            id: token.mintAddress
        }));
    };
    return (<div className='space-y-8'>
      <div className='space-y-4'>
        <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent'>
          Explore VRGDA Tokens
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-400'>
          Discover all tokens launched with Variable Rate Gradual Dutch Auctions
        </p>
      </div>

      <div className='flex gap-4'>
        <div className='relative flex-1'>
          <lucide_react_1.SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400'/>
          <input_1.Input placeholder='Search tokens by mint address...' className='pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>
        <button_1.Button onClick={refreshTokens} disabled={isLoading} variant='outline' className='h-12 px-4'>
          <lucide_react_1.RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
        </button_1.Button>
      </div>

      {error && (<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-red-600 dark:text-red-400'>Error: {error}</p>
        </div>)}

      {isLoading && tokens.length === 0 && (<div className='flex justify-center items-center py-12'>
          <div className='text-center'>
            <lucide_react_1.RefreshCwIcon className='h-8 w-8 animate-spin mx-auto mb-2 text-gray-400'/>
            <p className='text-gray-600 dark:text-gray-400'>Loading tokens...</p>
          </div>
        </div>)}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredTokens.map((token) => (<exports.TokenCard key={token.id} token={token} onClick={() => handleTokenClick(token)}/>))}
      </div>

      {!searchQuery && totalPages > 1 && (<div className='flex justify-center items-center space-x-4'>
          <button_1.Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} variant='outline' size='sm'>
            <lucide_react_1.ChevronLeftIcon className='h-4 w-4'/>
            Previous
          </button_1.Button>

          <div className='flex items-center space-x-2'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages)
                    return null;
                return (<button_1.Button key={pageNum} onClick={() => goToPage(pageNum)} variant={currentPage === pageNum ? 'default' : 'outline'} size='sm' className='w-10'>
                  {pageNum}
                </button_1.Button>);
            })}
          </div>

          <button_1.Button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} variant='outline' size='sm'>
            Next
            <lucide_react_1.ChevronRightIcon className='h-4 w-4'/>
          </button_1.Button>
        </div>)}

      {filteredTokens.length === 0 && !isLoading && (<div className='text-center py-12'>
          <p className='text-gray-600 dark:text-gray-400'>No tokens found matching your search.</p>
        </div>)}
    </div>);
}
