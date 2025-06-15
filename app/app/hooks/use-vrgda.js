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
exports.VRGDA_PROGRAM_ID = void 0;
exports.getVrgdaProgramId = getVrgdaProgramId;
exports.useVRGDA = useVRGDA;
const react_1 = require("react");
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const buffer_1 = require("buffer");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const spl_token_1 = require("@solana/spl-token");
const solana_provider_1 = require("~/components/solana/solana-provider");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const vrgda_json_1 = __importDefault(require("../../idl/idl/vrgda.json"));
const IDL = vrgda_json_1.default;
exports.VRGDA_PROGRAM_ID = new web3_js_1.PublicKey(import.meta.env.VITE_PROGRAM_ID || '9rUZoTzHGK7SJ9jfAzVLaYW9uMv1YkA6pQcby1tFGRZb');
function getVrgdaProgramId(cluster) {
    switch (cluster.name) {
        case 'devnet':
        case 'testnet':
        case 'mainnet-beta':
        default:
            return exports.VRGDA_PROGRAM_ID;
    }
}
function useVRGDA() {
    const { publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const getProvider = (0, solana_provider_1.useAnchorProvider)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const confirmTx = (0, react_1.useCallback)((txSig) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const connection = (_a = getProvider()) === null || _a === void 0 ? void 0 : _a.connection;
        if (!connection) {
            throw new Error('Connection not found');
        }
        const latestBlockhash = yield connection.getLatestBlockhash();
        yield connection.confirmTransaction({
            signature: txSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        const txUrl = `Tx confirmed: https://explorer.solana.com/tx/${txSig}?cluster=localnet&customUrl=${connection.rpcEndpoint}`;
        console.log(txUrl);
        return txUrl;
    }), [getProvider]);
    const initializeVRGDA = (params) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!publicKey)
            throw new Error('Wallet not connected');
        const provider = getProvider();
        if (!provider)
            throw new Error('Provider not found');
        const program = new anchor_1.Program(IDL, provider);
        // Validate parameters
        const validations = [
            [params.decayConstant <= 0, 'Decay constant must be greater than 0'],
            [params.r <= 0, 'r must be greater than 0'],
            [params.targetPrice <= 0, 'Target price must be greater than 0'],
            [params.totalSupply <= 0, 'Total supply must be greater than 0'],
            [params.totalSupply > 1e15, 'Total supply must be less than 1e15']
        ];
        for (const [condition, message] of validations) {
            if (condition)
                throw new Error(message);
        }
        try {
            setIsLoading(true);
            const mintPublic = params.mint.publicKey;
            const authority = params.authority ? new web3_js_1.PublicKey(params.authority) : publicKey;
            const transaction = new web3_js_1.Transaction();
            const mintInfo = yield program.provider.connection.getAccountInfo(mintPublic);
            const mintExists = mintInfo !== null;
            if (mintExists) {
                const mintAccount = yield (0, spl_token_1.getMint)(program.provider.connection, mintPublic);
                if (!((_a = mintAccount.mintAuthority) === null || _a === void 0 ? void 0 : _a.equals(authority))) {
                    throw new Error('You do not have mint authority over this existing mint');
                }
                if (mintAccount.decimals !== 6) {
                    console.warn(`Warning: Existing mint has ${mintAccount.decimals} decimals, expected 6`);
                }
            }
            else {
                const lamportsForMint = yield (0, spl_token_1.getMinimumBalanceForRentExemptMint)(program.provider.connection);
                transaction.add(web3_js_1.SystemProgram.createAccount({
                    fromPubkey: authority,
                    newAccountPubkey: mintPublic,
                    space: spl_token_1.MINT_SIZE,
                    lamports: lamportsForMint,
                    programId: spl_token_1.TOKEN_PROGRAM_ID,
                }), (0, spl_token_1.createInitializeMint2Instruction)(mintPublic, 6, authority, null, spl_token_1.TOKEN_PROGRAM_ID));
            }
            const [vrgdaPda] = web3_js_1.PublicKey.findProgramAddressSync([buffer_1.Buffer.from("vrgda"), mintPublic.toBuffer(), authority.toBuffer()], program.programId);
            const vrgdaInfo = yield program.provider.connection.getAccountInfo(vrgdaPda);
            if (vrgdaInfo) {
                throw new Error('VRGDA already exists for this mint and authority');
            }
            const wsolMintPubkey = params.wsolMint
                ? new web3_js_1.PublicKey(params.wsolMint)
                : new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
            const vrgdaVault = yield (0, spl_token_1.getAssociatedTokenAddress)(mintPublic, vrgdaPda, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
            const vrgdaSolAta = yield (0, spl_token_1.getAssociatedTokenAddress)(wsolMintPubkey, authority, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
            const ataInfo = yield program.provider.connection.getAccountInfo(vrgdaSolAta);
            if (!ataInfo) {
                transaction.add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(authority, vrgdaSolAta, authority, wsolMintPubkey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
            }
            const targetPriceWad = new anchor_1.BN(params.targetPrice * web3_js_1.LAMPORTS_PER_SOL).mul(new anchor_1.BN(web3_js_1.LAMPORTS_PER_SOL));
            const vrgdaStartTimestamp = new anchor_1.BN(params.vrgdaStartTimestamp || Math.floor(Date.now() / 1000));
            const initVrgdaIx = yield program.methods
                .initializeVrgda(targetPriceWad, new anchor_1.BN(params.decayConstant), vrgdaStartTimestamp, new anchor_1.BN(params.totalSupply), new anchor_1.BN(params.r))
                .accounts({
                authority,
                vrgda: vrgdaPda,
                vrgdaVault,
                mint: mintPublic,
                vrgdaSolAta,
                wsolMint: wsolMintPubkey,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
            })
                .signers([params.mint])
                .instruction();
            transaction.add(initVrgdaIx);
            transaction.add((0, spl_token_1.createSetAuthorityInstruction)(mintPublic, authority, spl_token_1.AuthorityType.MintTokens, vrgdaPda, [], spl_token_1.TOKEN_PROGRAM_ID));
            const tx = yield provider.sendAndConfirm(transaction, [params.mint], { maxRetries: 3 });
            yield confirmTx(tx);
            return {
                success: true,
                signature: tx,
                txUrl: `https://explorer.solana.com/tx/${tx}?cluster=${provider.connection.rpcEndpoint}`,
                vrgda: vrgdaPda.toString(),
                mint: mintPublic.toString(),
                authority: authority.toString()
            };
        }
        catch (error) {
            console.error('Error initializing VRGDA:', error);
            throw new Error(error.message || String(error));
        }
        finally {
            setIsLoading(false);
        }
    });
    const buyTokens = (params) => __awaiter(this, void 0, void 0, function* () {
        if (!publicKey)
            throw new Error('Wallet not connected');
        const provider = getProvider();
        if (!provider)
            throw new Error('Provider not found');
        if (params.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const program = new anchor_1.Program(IDL, provider);
        const vrgda = new web3_js_1.PublicKey(params.vrgdaAddress);
        const wsolMint = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
        try {
            setIsLoading(true);
            // Fetch VRGDA account data
            const vrgdaAccount = yield program.account.vrgda.fetch(vrgda);
            const { mint, authority } = vrgdaAccount;
            // Derive all required token accounts
            const [buyerAta, vrgdaVault, buyerWsolAta, vrgdaSolAta] = yield Promise.all([
                (0, spl_token_1.getAssociatedTokenAddress)(mint, publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID),
                (0, spl_token_1.getAssociatedTokenAddress)(mint, vrgda, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID),
                (0, spl_token_1.getAssociatedTokenAddress)(wsolMint, publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID),
                (0, spl_token_1.getAssociatedTokenAddress)(wsolMint, authority, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID)
            ]);
            // Execute buy transaction
            const tx = yield program.methods
                .buy(new anchor_1.BN(params.amount))
                .accountsStrict({
                buyer: publicKey,
                vrgda,
                mint,
                wsolMint,
                buyerWsolAta,
                buyerAta,
                vrgdaVault,
                vrgdaSolAta,
                authority,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
            })
                .preInstructions([
                anchor_1.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 2000000 })
            ])
                .rpc();
            const txUrl = yield confirmTx(tx);
            return {
                success: true,
                signature: tx,
                txUrl,
                amount: params.amount,
                destination: buyerAta.toString()
            };
        }
        catch (error) {
            console.error('Error buying tokens:', error);
            throw new Error(error.message || String(error));
        }
        finally {
            setIsLoading(false);
        }
    });
    const calculatePrice = (params) => {
        const { timePassed, tokensSold, targetPrice, decayConstant, r } = params;
        const price = targetPrice * Math.exp(-decayConstant * (timePassed - tokensSold / r));
        return Math.max(price, params.reservePrice || 0);
    };
    const getVrgdaInfo = (vrgdaAddress) => __awaiter(this, void 0, void 0, function* () {
        const provider = getProvider();
        if (!provider)
            throw new Error('Provider not found');
        const program = new anchor_1.Program(IDL, provider);
        try {
            const vrgda = new web3_js_1.PublicKey(vrgdaAddress);
            const vrgdaAccount = yield program.account.vrgda.fetch(vrgda);
            const mint = vrgdaAccount.mint;
            const currentTime = Math.floor(Date.now() / 1000);
            const startTime = Number(vrgdaAccount.vrgdaStartTimestamp.toString());
            // Calculate time passed since start (in seconds)
            const timePassed = Math.max(0, currentTime - startTime);
            const totalSupply = Number(vrgdaAccount.totalSupply.toString());
            const tokensSold = Number(vrgdaAccount.tokensSold.toString());
            const remainingSupply = totalSupply - tokensSold;
            const r = Number(vrgdaAccount.schedule.linearSchedule.r.toString());
            const targetPrice = Number(vrgdaAccount.targetPrice.toString()) / (web3_js_1.LAMPORTS_PER_SOL * web3_js_1.LAMPORTS_PER_SOL); // Convert from WAD format (18 decimals) to SOL
            const currentPrice = vrgdaAccount.currentPrice.toNumber() / (web3_js_1.LAMPORTS_PER_SOL * web3_js_1.LAMPORTS_PER_SOL); // Convert from WAD format (18 decimals) to SOL
            const decayConstant = Number(vrgdaAccount.decayConstantPercent.toString()) / 100;
            return {
                vrgdaAddress: vrgda.toString(),
                mintAddress: mint.toString(),
                authority: vrgdaAccount.authority.toString(),
                totalSupply,
                tokensSold,
                remainingSupply,
                targetPrice,
                currentPrice,
                decayConstant,
                r,
                startTime,
                timePassed: timePassed,
                vrgdaStartTimestamp: Number(vrgdaAccount.vrgdaStartTimestamp.toString()),
                // 1 week from now
                auctionEndTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
                isAuctionActive: !vrgdaAccount.auctionEnded,
                reservePrice: 0,
                metadata: {
                    name: 'VRGDA Token',
                    symbol: 'VRGDA',
                    uri: ''
                }
            };
            // const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
            //   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
            // )
            // const [metadataPDA] = PublicKey.findProgramAddressSync(
            //   [
            //     Buffer.from("metadata"),
            //     TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            //     mint.toBuffer(),
            //   ],
            //   TOKEN_METADATA_PROGRAM_ID
            // )
            // const metadataAccount = await program.provider.connection.getAccountInfo(metadataPDA)
            // return await processVrgdaTokenData(vrgdaAccount, metadataAccount, mint, vrgda, metadataPDA)
        }
        catch (error) {
            console.error('Error fetching VRGDA info:', error);
            throw error;
        }
    });
    const processVrgdaTokenData = (vrgdaAccount, metadataAccount, mint, vrgda, metadataPDA) => __awaiter(this, void 0, void 0, function* () {
        let metadata = null;
        if (metadataAccount && metadataAccount.data) {
            try {
                // @ts-ignore correct according to mpl-token-metadata docs
                const meta = (0, mpl_token_metadata_1.deserializeMetadata)(metadataAccount);
                metadata = {
                    name: meta.name,
                    symbol: meta.symbol,
                    uri: meta.uri,
                    metadataPDA: metadataPDA.toString(),
                };
            }
            catch (parseError) {
                console.warn('Failed to parse metadata:', parseError);
            }
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const startTimeNumber = Number(vrgdaAccount.vrgdaStartTimestamp.toString());
        // Calculate time passed since start (in seconds)
        const timePassed = Math.max(0, currentTime - startTimeNumber);
        const totalSupplyNumber = Number(vrgdaAccount.totalSupply.toString());
        const tokensSoldNumber = Number(vrgdaAccount.tokensSold.toString());
        const remainingSupply = totalSupplyNumber - tokensSoldNumber;
        // Convert target price from WAD format (18 decimals) to SOL
        const targetPriceNumber = Number(vrgdaAccount.targetPrice.toString()) / (web3_js_1.LAMPORTS_PER_SOL * web3_js_1.LAMPORTS_PER_SOL);
        // Calculate current price using VRGDA formula
        const decayConstantPercent = Number(vrgdaAccount.decayConstantPercent.toString());
        const r = Number(vrgdaAccount.r.toString());
        const currentPrice = calculatePrice({
            timePassed: timePassed / 3600, // Convert to hours for consistency with old calculation
            tokensSold: tokensSoldNumber,
            targetPrice: targetPriceNumber,
            decayConstant: decayConstantPercent / 100, // Convert from percentage
            r: r,
            reservePrice: 0 // VRGDA doesn't have reserve price concept
        });
        return {
            vrgdaAddress: vrgda.toString(),
            mintAddress: mint.toString(),
            authority: vrgdaAccount.authority.toString(),
            totalSupply: totalSupplyNumber,
            tokensSold: tokensSoldNumber,
            remainingSupply,
            targetPrice: targetPriceNumber,
            currentPrice,
            decayConstantPercent: decayConstantPercent,
            r: r,
            startTime: startTimeNumber,
            vrgdaStartTimestamp: startTimeNumber,
            timePassed,
            metadata
        };
    });
    return {
        isLoading,
        initializeVRGDA,
        buyTokens,
        calculatePrice,
        getVrgdaInfo,
        // getVrgdaInfoByMint
    };
}
