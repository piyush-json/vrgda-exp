"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TokenDetails;
const react_1 = require("react");
const card_1 = require("~/components/ui/card");
const lucide_react_1 = require("lucide-react");
const buy_token_modal_1 = require("./buy-token-modal");
const token_header_1 = require("./token-header");
const auction_status_1 = require("./auction-status");
const token_metrics_1 = require("./token-metrics");
const auction_progress_1 = require("./auction-progress");
const price_chart_1 = require("./price-chart");
const token_info_card_1 = require("./token-info-card");
const buy_token_card_1 = require("./buy-token-card");
const use_vrgda_1 = require("~/hooks/use-vrgda");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const sonner_1 = require("sonner");
function TokenDetails({ params }) {
    var _a, _b;
    const { id: tokenId } = params;
    const { getVrgdaInfo, buyTokens, calculatePrice, isLoading: vrgdaLoading } = (0, use_vrgda_1.useVRGDA)();
    const { connect, publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const [buyAmount, setBuyAmount] = (0, react_1.useState)('');
    const [tokenData, setTokenData] = (0, react_1.useState)(null);
    const [mintInfo, setMintInfo] = (0, react_1.useState)(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = (0, react_1.useState)(false);
    const [buyStatus, setBuyStatus] = (0, react_1.useState)('idle');
    const [auctionData, setAuctionData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const formatNumber = (num, decimals = 6) => {
        if (num < 0.000001)
            return num.toExponential(2);
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });
    };
    (0, react_1.useEffect)(() => {
        const fetchMintInfo = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!tokenId)
                return;
            try {
                setLoading(true);
                setError(null);
                const info = yield getVrgdaInfo(tokenId);
                setMintInfo(info);
                const convertedTokenData = {
                    id: tokenId,
                    name: ((_a = info.metadata) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Token',
                    symbol: ((_b = info.metadata) === null || _b === void 0 ? void 0 : _b.symbol) || 'UNK',
                    logo: ((_c = info.metadata) === null || _c === void 0 ? void 0 : _c.uri) || '/default-token-logo.png',
                    price: info.currentPrice,
                    marketCap: info.totalSupply * info.currentPrice,
                    tokenSold: info.tokensSold,
                    description: `VRGDA auction token with ${info.totalSupply.toLocaleString()} total supply`,
                    isAuctionActive: info.isAuctionActive,
                    reservePrice: info.reservePrice,
                    targetPrice: info.targetPrice,
                    currentPrice: info.currentPrice,
                    decayConstant: info.decayConstant,
                    r: info.r,
                    startTime: info.startTime,
                    totalSupply: info.totalSupply,
                    tokensSold: info.tokensSold
                };
                console.log('Converted token data:', convertedTokenData);
                setTokenData(convertedTokenData);
                const endTime = new Date(info.auctionEndTime * 1000);
                const now = new Date();
                const timeDiff = endTime.getTime() - now.getTime();
                if (timeDiff > 0) {
                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const data = [];
                    const targetPrice = info.targetPrice;
                    const decayConstant = info.decayConstant;
                    const r = info.r;
                    for (let i = 0; i <= days; i++) {
                        const timeElapsed = i;
                        const tokensSold = 0;
                        const price = calculatePrice({
                            timePassed: timeElapsed,
                            tokensSold,
                            targetPrice,
                            decayConstant,
                            r,
                            reservePrice: info.reservePrice
                        });
                        data.push({
                            time: i,
                            price: Math.max(price, info.reservePrice)
                        });
                    }
                    setAuctionData(data);
                }
            }
            catch (err) {
                console.error('Error fetching mint info:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch token data');
            }
            finally {
                setLoading(false);
            }
        });
        fetchMintInfo();
    }, [tokenId]);
    const handleBuyTokens = (amount) => __awaiter(this, void 0, void 0, function* () {
        if (!tokenId)
            return;
        setBuyStatus('loading');
        try {
            const result = yield buyTokens({
                amount,
                vrgdaAddress: tokenId
            });
            console.log('Buy tokens result:', result);
            if (result && result.success) {
                setBuyStatus('success');
                sonner_1.toast.success('Purchase successful!', {
                    description: `You have successfully purchased ${formatNumber(amount)} ${tokenData === null || tokenData === void 0 ? void 0 : tokenData.symbol}.`
                });
                const updatedInfo = yield getVrgdaInfo(tokenId);
                setMintInfo(updatedInfo);
                setBuyStatus('idle');
                setIsBuyModalOpen(false);
            }
            else {
                setBuyStatus('error');
                setTimeout(() => setBuyStatus('idle'), 2000);
            }
        }
        catch (error) {
            console.error('Error buying tokens:', error);
            sonner_1.toast.error('Purchase failed', {
                description: error instanceof Error ? error.message : 'An unexpected error occurred.'
            });
            setBuyStatus('error');
            setTimeout(() => setBuyStatus('idle'), 2000);
        }
    });
    const handleBuyButtonClick = () => {
        if (publicKey) {
            setIsBuyModalOpen(true);
        }
        else {
            connect().then(() => {
                setIsBuyModalOpen(true);
            }).catch((err) => {
                console.error('Error connecting wallet:', err);
                setError('Failed to connect wallet');
            });
        }
    };
    if (loading || vrgdaLoading) {
        console.log('Loading token details...');
        return (<div className='flex items-center justify-center h-[60vh]'>
        <lucide_react_1.LoaderIcon className='h-8 w-8 animate-spin text-gray-400'/>
      </div>);
    }
    if (error || !tokenData || !mintInfo) {
        return (<div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center'>
          <lucide_react_1.AlertTriangleIcon className='h-12 w-12 text-red-500 mx-auto mb-4'/>
          <h2 className='text-xl font-semibold mb-2'>Token Not Found</h2>
          <p className='text-gray-500'>{error || 'This token does not exist or is not a VRGDA token.'}</p>
        </div>
      </div>);
    }
    const currentTotalAmount = Array.from({ length: parseInt(buyAmount) || 0 }, (_, i) => i + 1)
        .reduce((total, amount) => total + calculatePrice({
        targetPrice: mintInfo.targetPrice,
        decayConstant: mintInfo.decayConstant,
        r: mintInfo.r,
        timePassed: 0,
        tokensSold: mintInfo.tokensSold + amount,
        reservePrice: mintInfo.reservePrice
    }), 0).toFixed(6);
    return (<div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:items-start gap-6'>
        <div className='md:w-2/3 space-y-6'>
          <card_1.Card>
            <card_1.CardHeader className='pb-2'>
              <token_header_1.TokenHeader tokenId={tokenId} mintInfo={mintInfo}/>
            </card_1.CardHeader>

            <card_1.CardContent className='space-y-6'>
              <auction_status_1.AuctionStatus isAuctionActive={mintInfo.isAuctionActive}/>
              <token_metrics_1.TokenMetrics mintInfo={mintInfo}/>
              <auction_progress_1.AuctionProgress mintInfo={mintInfo}/>
              <price_chart_1.PriceChart auctionData={auctionData}/>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <div className='md:w-1/3 space-y-6'>
          <token_info_card_1.TokenInfoCard mintInfo={mintInfo} tokenId={tokenId}/>
          <buy_token_card_1.BuyTokenCard mintInfo={mintInfo} buyAmount={buyAmount} setBuyAmount={setBuyAmount} currentTotalAmount={currentTotalAmount} onBuyClick={handleBuyButtonClick}/>
        </div>

        <buy_token_modal_1.BuyTokenModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} tokenName={((_a = mintInfo.metadata) === null || _a === void 0 ? void 0 : _a.name) || mintInfo.symbol} tokenSymbol={mintInfo.symbol} tokenLogo={((_b = mintInfo.metadata) === null || _b === void 0 ? void 0 : _b.uri) || '/default-token-logo.png'} currentPrice={mintInfo.currentPrice / 1e9} buyAmount={buyAmount} setBuyAmount={setBuyAmount} onBuy={handleBuyTokens} buyStatus={buyStatus} mintAddress={tokenId} mintInfo={tokenData}/>
      </div>
    </div>);
}
