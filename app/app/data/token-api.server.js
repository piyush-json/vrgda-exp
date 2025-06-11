"use strict";
/**
 * API service for fetching token data from Birdeye API
 */
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
exports.fetchTokenData = fetchTokenData;
exports.fetchTokenPriceHistory = fetchTokenPriceHistory;
exports.fetchTopTokens = fetchTopTokens;
// Birdeye API base URL
const BIRDEYE_API_BASE_URL = "https://public-api.birdeye.so";
const BIRDEYE_API_KEY = "27d36736d354435d8594f549ce0ed77c"; // Replace with your API key in production
// Default headers for Birdeye API
const defaultHeaders = {
    "X-API-KEY": BIRDEYE_API_KEY,
    "Content-Type": "application/json",
};
/**
 * Fetch token price and metadata from Birdeye API
 * @param tokenAddress The Solana token address
 */
function fetchTokenData(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${BIRDEYE_API_BASE_URL}/defi/token_overview?address=${tokenAddress}`, {
                method: "GET",
                headers: defaultHeaders,
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            return {
                address: data.data.address,
                name: data.data.name,
                symbol: data.data.symbol,
                decimals: data.data.decimals,
                logo: data.data.logoURI,
                price: data.data.price,
                priceChange24h: data.data.priceChange24hPercent,
                marketCap: data.data.marketCap,
                volume24h: data.data.v24hUSD,
                // Additional fields
                totalSupply: data.data.totalSupply,
                circulatingSupply: data.data.circulatingSupply,
                holders: data.data.holder,
                liquidity: data.data.liquidity,
                extensions: data.data.extensions,
                lastTradeTime: data.data.lastTradeHumanTime,
                uniqueWallets24h: data.data.uniqueWallet24h,
                trades24h: data.data.trade24h,
            };
        }
        catch (error) {
            console.error("Error fetching token data:", error);
            throw error;
        }
    });
}
function fetchTokenPriceHistory(tokenAddress_1) {
    return __awaiter(this, arguments, void 0, function* (tokenAddress, timeframe = "24h") {
        try {
            const response = yield fetch(`${BIRDEYE_API_BASE_URL}/defi/v3/token/trade-data/single?address=${tokenAddress}`, {
                method: "GET",
                headers: Object.assign(Object.assign({}, defaultHeaders), { 'x-chain': 'solana' }),
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            const history = data.data;
            const result = {
                price: history.price,
                priceChange: history[`price_change_${timeframe}_percent`],
                volume: {
                    total: history[`volume_${timeframe}`],
                    totalUSD: history[`volume_${timeframe}_usd`],
                    buy: history[`volume_buy_${timeframe}`],
                    buyUSD: history[`volume_buy_${timeframe}_usd`],
                    sell: history[`volume_sell_${timeframe}`],
                    sellUSD: history[`volume_sell_${timeframe}_usd`],
                },
                trades: {
                    total: history[`trade_${timeframe}`],
                    buy: history[`buy_${timeframe}`],
                    sell: history[`sell_${timeframe}`],
                },
                uniqueWallets: history[`unique_wallet_${timeframe}`],
            };
            return result;
        }
        catch (error) {
            console.error("Error fetching token price history:", error);
            throw error;
        }
    });
}
function fetchTopTokens() {
    return __awaiter(this, arguments, void 0, function* ({ sort_by = 'liquidity', sort_type = 'desc', min_liquidity, max_liquidity, min_market_cap, max_market_cap, min_volume_24h_usd, min_holder, offset = 0, limit = 10 } = {}) {
        try {
            const params = new URLSearchParams({
                sort_by,
                sort_type,
                offset: offset.toString(),
                limit: Math.min(limit, 100).toString()
            });
            if (min_liquidity)
                params.append('min_liquidity', min_liquidity.toString());
            if (max_liquidity)
                params.append('max_liquidity', max_liquidity.toString());
            if (min_market_cap)
                params.append('min_market_cap', min_market_cap.toString());
            if (max_market_cap)
                params.append('max_market_cap', max_market_cap.toString());
            if (min_volume_24h_usd)
                params.append('min_volume_24h_usd', min_volume_24h_usd.toString());
            if (min_holder)
                params.append('min_holder', min_holder.toString());
            const response = yield fetch(`${BIRDEYE_API_BASE_URL}/defi/v3/token/list?${params}`, {
                method: "GET",
                headers: Object.assign(Object.assign({}, defaultHeaders), { 'x-chain': 'solana' }),
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            return data.data.items;
        }
        catch (error) {
            console.error("Error fetching top tokens:", error);
            throw error;
        }
    });
}
// /**
//  * Fetch token holders data from Birdeye API
//  * @param tokenAddress The Solana token address
//  * @param limit Number of holders to fetch
//  * @param offset Pagination offset
//  */
// export async function fetchTokenHolders(
//   tokenAddress: string,
//   limit = 10,
//   offset = 0
// ) {
//   try {
//     const response = await fetch(
//       `${BIRDEYE_API_BASE_URL}/public/token_holders?token_address=${tokenAddress}&offset=${offset}&limit=${limit}`,
//       {
//         method: "GET",
//         headers: defaultHeaders,
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`API error: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error("Error fetching token holders:", error);
//     throw error;
//   }
// }
// /**
//  * Fetch user token balances from Birdeye API
//  * @param walletAddress The Solana wallet address
//  */
// export async function fetchUserTokens(walletAddress: string) {
//   try {
//     const response = await fetch(
//       `${BIRDEYE_API_BASE_URL}/public/wallet_overview?address=${walletAddress}`,
//       {
//         method: "GET",
//         headers: defaultHeaders,
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`API error: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error("Error fetching user tokens:", error);
//     throw error;
//   }
// }
// // Mock data for development when API is not available
// export const mockTokenData = {
//   SOL: {
//     address: "So11111111111111111111111111111111111111112",
//     name: "Solana",
//     symbol: "SOL",
//     decimals: 9,
//     logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
//     price: 62.45,
//     priceChange24h: 2.5,
//     marketCap: 28500000000,
//     volume24h: 1250000000,
//   },
//   USDC: {
//     address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
//     name: "USD Coin",
//     symbol: "USDC",
//     decimals: 6,
//     logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
//     price: 1.0,
//     priceChange24h: 0.01,
//     marketCap: 34500000000,
//     volume24h: 2100000000,
//   },
//   BONK: {
//     address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
//     name: "Bonk",
//     symbol: "BONK",
//     decimals: 5,
//     logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
//     price: 0.00002345,
//     priceChange24h: 5.2,
//     marketCap: 1450000000,
//     volume24h: 125000000,
//   },
//   JTO: {
//     address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
//     name: "Jito",
//     symbol: "JTO",
//     decimals: 9,
//     logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.png",
//     price: 3.24,
//     priceChange24h: -1.8,
//     marketCap: 375000000,
//     volume24h: 42000000,
//   },
// };
// // Mock price history data
// export const mockPriceHistory = {
//   "1D": Array.from({ length: 24 }, (_, i) => ({
//     unixTime: Math.floor(Date.now() / 1000) - (24 - i) * 3600,
//     value: 60 + Math.random() * 5,
//   })),
//   "1W": Array.from({ length: 7 }, (_, i) => ({
//     unixTime: Math.floor(Date.now() / 1000) - (7 - i) * 86400,
//     value: 58 + Math.random() * 8,
//   })),
//   "1M": Array.from({ length: 30 }, (_, i) => ({
//     unixTime: Math.floor(Date.now() / 1000) - (30 - i) * 86400,
//     value: 55 + Math.random() * 15,
//   })),
// };
// // Mock user token balances
// export const mockUserTokens = {
//   tokens: [
//     {
//       address: "So11111111111111111111111111111111111111112",
//       symbol: "SOL",
//       name: "Solana",
//       amount: 12.5,
//       decimals: 9,
//       price: 62.45,
//       value: 780.625,
//       logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
//     },
//     {
//       address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
//       symbol: "USDC",
//       name: "USD Coin",
//       amount: 1250.75,
//       decimals: 6,
//       price: 1.0,
//       value: 1250.75,
//       logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
//     },
//     {
//       address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
//       symbol: "BONK",
//       name: "Bonk",
//       amount: 25000000,
//       decimals: 5,
//       price: 0.00002345,
//       value: 586.25,
//       logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
//     },
//   ],
//   totalValue: 2617.625,
// };
