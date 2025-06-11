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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAllTokens = useAllTokens;
const react_1 = require("react");
const anchor_1 = require("@coral-xyz/anchor");
const solana_provider_1 = require("~/components/solana/solana-provider");
const vrgda_json_1 = __importDefault(require("idl/idl/vrgda.json"));
const CACHE_KEY = 'vrgda_mint_ids_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const TOKENS_PER_PAGE = 30;
function useAllTokens() {
    const [allTokens, setAllTokens] = (0, react_1.useState)([]);
    const [tokens, setTokens] = (0, react_1.useState)([]);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const getProvider = (0, solana_provider_1.useAnchorProvider)();
    const getCachedData = (0, react_1.useCallback)(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached)
                return null;
            const parsedCache = JSON.parse(cached);
            const now = Date.now();
            if (now - parsedCache.timestamp > CACHE_DURATION) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            return parsedCache.allTokens;
        }
        catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }, []);
    const setCachedData = (0, react_1.useCallback)((tokens) => {
        try {
            const cacheData = {
                allTokens: tokens,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
        catch (error) {
            console.error('Error writing to cache:', error);
        }
    }, []);
    const updatePaginatedTokens = (0, react_1.useCallback)((allTokens, page) => {
        const startIndex = (page - 1) * TOKENS_PER_PAGE;
        const endIndex = startIndex + TOKENS_PER_PAGE;
        const paginatedTokens = allTokens.slice(startIndex, endIndex);
        setTokens(paginatedTokens);
        setTotalPages(Math.ceil(allTokens.length / TOKENS_PER_PAGE));
    }, []);
    const fetchAllTokens = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        const provider = getProvider();
        if (!provider) {
            setError('Provider not found');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const program = new anchor_1.Program(vrgda_json_1.default, provider);
            const mintStates = yield program.account.vrgda.all();
            const allTokens = mintStates.map((mintStateAccount, index) => ({
                vrgda: mintStateAccount.publicKey.toString(),
                mintAddress: mintStateAccount.account.mint.toString(),
                r: mintStateAccount.account.schedule.linearSchedule.r.toString(),
                // reservePrice: mintStateAccount.account.reservePrice.toString(),
                reservePrice: '0',
                decayConstant: (Number(mintStateAccount.account.decayConstantPercent.toString()) / 100).toString(),
                symbol: 'VRGDA',
                totalSupply: mintStateAccount.account.totalSupply.toString(),
                // auctionDurationDays: mintStateAccount.account.auctionDurationDays.toString(),
                auctionDurationDays: '7',
                startTime: mintStateAccount.account.vrgdaStartTimestamp.toString(),
                tokensSold: mintStateAccount.account.tokensSold.toString(),
                id: `${mintStateAccount.publicKey.toString()}-${index}`
            }));
            console.log('Fetched tokens:', allTokens);
            setCachedData(allTokens);
            setAllTokens(allTokens);
            updatePaginatedTokens(allTokens, 1);
            setCurrentPage(1);
        }
        catch (error) {
            console.error('Error fetching tokens:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch tokens');
        }
        finally {
            setIsLoading(false);
        }
    }), [getProvider, setCachedData, updatePaginatedTokens]);
    const goToPage = (0, react_1.useCallback)((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            updatePaginatedTokens(allTokens, page);
        }
    }, [allTokens, totalPages, updatePaginatedTokens]);
    const refreshTokens = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        localStorage.removeItem(CACHE_KEY);
        yield fetchAllTokens();
    }), [fetchAllTokens]);
    (0, react_1.useEffect)(() => {
        const cachedTokens = getCachedData();
        if (cachedTokens && cachedTokens.length > 0) {
            setAllTokens(cachedTokens);
            updatePaginatedTokens(cachedTokens, 1);
            setCurrentPage(1);
        }
        else {
            fetchAllTokens();
        }
    }, [getCachedData, fetchAllTokens, updatePaginatedTokens]);
    return {
        tokens,
        allTokens,
        currentPage,
        totalPages,
        isLoading,
        error,
        refreshTokens,
        fetchAllTokens,
        goToPage
    };
}
