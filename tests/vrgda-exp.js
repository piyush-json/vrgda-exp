"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
// Import the IDL directly to ensure we have the correct version
describe("vrgda", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.getProvider();
    const connection = provider.connection;
    const program = anchor.workspace.Vrgda;
    const confirmTx = (txSig) => __awaiter(void 0, void 0, void 0, function* () {
        const latestBlockhash = yield connection.getLatestBlockhash();
        yield connection.confirmTransaction({
            signature: txSig,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        console.log(`Tx confirmed: https://explorer.solana.com/tx/${txSig}?cluster=localnet&customUrl=${connection.rpcEndpoint}`);
        return txSig;
    });
    // We'll create local Keypairs. We must ensure each gets airdropped enough SOL.
    const authority = web3_js_1.Keypair.generate();
    const buyer = web3_js_1.Keypair.generate();
    const buyer2 = web3_js_1.Keypair.generate();
    const buyer3 = web3_js_1.Keypair.generate();
    // This mint is the "token being sold."
    const mintKeypair = web3_js_1.Keypair.generate();
    const localWsolMintKeypair = web3_js_1.Keypair.generate();
    // Derive the VRGDA PDA
    const [vrgdaPda] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("vrgda"),
        mintKeypair.publicKey.toBuffer(),
        authority.publicKey.toBuffer(),
    ], program.programId);
    // We'll store addresses for the VRGDA vault, VRGDA wSOL vault, etc.
    let vrgdaVault;
    let vrgdaSolAta;
    let buyerAta;
    let buyer2Ata;
    let buyer3Ata;
    let buyerwSolAta;
    let buyer2wSolAta;
    let buyer3wSolAta;
    before("Airdrop, create mint, and compute associated addresses", () => __awaiter(void 0, void 0, void 0, function* () {
        // 1) Airdrop 20 SOL to each local Keypair so they can pay for creation.
        yield confirmTx(yield connection.requestAirdrop(authority.publicKey, 20 * web3_js_1.LAMPORTS_PER_SOL));
        yield confirmTx(yield connection.requestAirdrop(buyer.publicKey, 20 * web3_js_1.LAMPORTS_PER_SOL));
        yield confirmTx(yield connection.requestAirdrop(buyer2.publicKey, 20 * web3_js_1.LAMPORTS_PER_SOL));
        console.log("Authority:", authority.publicKey.toString());
        console.log("VRGDA PDA:", vrgdaPda.toString());
        // 2) Create the "mint being sold."
        const lamportsForMint = yield (0, spl_token_1.getMinimumBalanceForRentExemptMint)(connection);
        let createMintTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: provider.publicKey, // The default anchor provider can pay for this
            newAccountPubkey: mintKeypair.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports: lamportsForMint,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMint2Instruction)(mintKeypair.publicKey, 6, // decimals
        provider.publicKey, // mint authority
        null, // freeze authority
        spl_token_1.TOKEN_PROGRAM_ID));
        // const transferAuthorityTx = new Transaction().add(
        //   createSetAuthorityInstruction(
        //     mintKeypair.publicKey,
        //     authority.publicKey,             // Current authority (provider) 
        //     AuthorityType.MintTokens,
        //     vrgdaPda,                       // New authority
        //     [],
        //     TOKEN_PROGRAM_ID
        //   )
        // );
        yield provider.sendAndConfirm(createMintTx, [mintKeypair]);
        // await provider.sendAndConfirm(transferAuthorityTx), [mintKeypair, authority];
        const lamportsforsolmint = yield (0, spl_token_1.getMinimumBalanceForRentExemptMint)(connection);
        let createWSOLMINTtx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: provider.publicKey, // The default anchor provider can pay for this
            newAccountPubkey: localWsolMintKeypair.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports: lamportsforsolmint,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMint2Instruction)(localWsolMintKeypair.publicKey, 9, // decimals
        provider.publicKey, // mint authority
        null, // freeze authority
        spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(createWSOLMINTtx, [localWsolMintKeypair]);
        // 3) We'll derive the VRGDA vault for the minted token being sold.
        vrgdaVault = yield (0, spl_token_1.getAssociatedTokenAddress)(mintKeypair.publicKey, vrgdaPda, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        // 4) We'll derive the VRGDA's wSOL vault
        vrgdaSolAta = yield (0, spl_token_1.getAssociatedTokenAddress)(localWsolMintKeypair.publicKey, authority.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        // Create the VRGDA's wSOL ATA
        const createVrgdaSolAtaTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(provider.publicKey, vrgdaSolAta, authority.publicKey, localWsolMintKeypair.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(createVrgdaSolAtaTx);
        // 5) We'll also pre-derive the buyer's associated addresses:
        buyerAta = yield (0, spl_token_1.getAssociatedTokenAddress)(mintKeypair.publicKey, buyer.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        buyer2Ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mintKeypair.publicKey, buyer2.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        buyer3Ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mintKeypair.publicKey, buyer3.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        buyerwSolAta = yield (0, spl_token_1.getAssociatedTokenAddress)(localWsolMintKeypair.publicKey, buyer.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        buyer2wSolAta = yield (0, spl_token_1.getAssociatedTokenAddress)(localWsolMintKeypair.publicKey, buyer2.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        buyer3wSolAta = yield (0, spl_token_1.getAssociatedTokenAddress)(localWsolMintKeypair.publicKey, buyer3.publicKey, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        // Create the buyer's wSOL ATA
        const createBuyerwSolAtaTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(provider.publicKey, buyerwSolAta, buyer.publicKey, localWsolMintKeypair.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(createBuyerwSolAtaTx);
        // Create the buyer2's wSOL ATA
        const createBuyer2wSolAtaTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(provider.publicKey, buyer2wSolAta, buyer2.publicKey, localWsolMintKeypair.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(createBuyer2wSolAtaTx);
        // Create the buyer3's wSOL ATA
        const createBuyer3wSolAtaTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(provider.publicKey, buyer3wSolAta, buyer3.publicKey, localWsolMintKeypair.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(createBuyer3wSolAtaTx);
        // Mint wSOL to VRGDA's ATA
        const WsolminttoTx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, vrgdaSolAta, provider.publicKey, 1000000000, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(WsolminttoTx);
        // Mint wSOL to buyer's ATA
        const mintToBuyerTx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyerwSolAta, provider.publicKey, 1000000000000, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyerTx);
        // Mint wSOL to buyer2's ATA
        const mintToBuyer2Tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyer2wSolAta, provider.publicKey, 1000000000000, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyer2Tx);
        // Mint wSOL to buyer3's ATA
        const mintToBuyer3Tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyer3wSolAta, provider.publicKey, 1000000000000, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyer3Tx);
    }));
    it("Initialize VRGDA", () => __awaiter(void 0, void 0, void 0, function* () {
        const totalSupply = new anchor_1.BN(1000000000000000);
        const ONE_WAD = new anchor_1.BN("1000000000000000000"); // 1e18
        // const targetPrice = new BN(40);
        // const lamportsPerSol = new BN(LAMPORTS_PER_SOL);
        // const targetPriceWad = targetPrice.mul(ONE_WAD).div(lamportsPerSol);
        const decayConstantPercent = new anchor_1.BN(5);
        const humanPriceSol = 4;
        // 2) Convert SOL → lamports (9 decimals)
        //    0.004 * 10^9 = 4_000_000
        const lamports = Math.floor(humanPriceSol * web3_js_1.LAMPORTS_PER_SOL);
        console.log("lamports:", lamports);
        const targetPriceWad = new anchor_1.BN(lamports).mul(new anchor_1.BN(web3_js_1.LAMPORTS_PER_SOL));
        console.log("targetPriceWad:", targetPriceWad.toString());
        console.log("Decay constant percent:", decayConstantPercent.toString());
        // Multiply by 1e18 first, then divide by 100 to preserve the fraction.
        const decayVal = decayConstantPercent.mul(ONE_WAD).div(new anchor_1.BN(100));
        const r = new anchor_1.BN(1000000);
        const vrgdaStartTimestamp = new anchor_1.BN(0);
        console.log("Initializing VRGDA with r:", r.toString());
        console.log("- Authority:", authority.publicKey.toString());
        console.log("- VRGDA PDA:", vrgdaPda.toString());
        // The instruction will create the VRGDA's vault for the minted token, 
        // and also the wsol ATA with authority = authority (on the program side).
        const txSig = yield program.methods
            .initializeVrgda(targetPriceWad, decayConstantPercent, vrgdaStartTimestamp, totalSupply, r)
            .accountsStrict({
            authority: authority.publicKey,
            vrgda: vrgdaPda,
            vrgdaVault,
            mint: mintKeypair.publicKey,
            vrgdaSolAta,
            wsolMint: localWsolMintKeypair.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
            .remainingAccounts([
            {
                pubkey: authority.publicKey,
                isWritable: true,
                isSigner: true
            }
        ])
            .signers([authority])
            .rpc();
        yield confirmTx(txSig);
        // Mint tokens to VRGDA's vault if desired.
        const mintTx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(mintKeypair.publicKey, vrgdaVault, provider.publicKey, // mint authority from createInitializeMint2Instruction
        1000000000000000, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintTx);
        const mintToBuyer1Tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyerwSolAta, provider.publicKey, // mint authority from createInitializeMint2Instruction
        1e+21, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyer1Tx);
        const mintToBuyer2Tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyer2wSolAta, provider.publicKey, // mint authority from createInitializeMint2Instruction
        1e+21, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyer2Tx);
        const mintToBuyer3Tx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, buyer3wSolAta, provider.publicKey, // mint authority from createInitializeMint2Instruction
        1e+21, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(mintToBuyer3Tx);
        const transferAuthorityTx = new web3_js_1.Transaction().add((0, spl_token_1.createSetAuthorityInstruction)(mintKeypair.publicKey, provider.publicKey, // Current authority (provider) 
        spl_token_1.AuthorityType.MintTokens, vrgdaPda, // New authority
        [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(transferAuthorityTx);
        // const transferWsolAuthorityTx = new Transaction().add(
        //   createSetAuthorityInstruction(
        //     vrgdaSolAta,
        //     authority.publicKey,             // Current authority (provider) 
        //     AuthorityType.AccountOwner,
        //     vrgdaPda,                       // New authority
        //     [],
        //     TOKEN_PROGRAM_ID
        //   )
        // );
        // await provider.sendAndConfirm(transferWsolAuthorityTx);
        //Mint WSOL to VRGDA's wsol ATA
        const WsolMintTx = new web3_js_1.Transaction().add((0, spl_token_1.createMintToInstruction)(localWsolMintKeypair.publicKey, vrgdaSolAta, provider.publicKey, 1e+21, [], spl_token_1.TOKEN_PROGRAM_ID));
        yield provider.sendAndConfirm(WsolMintTx);
        const vrgdaAccount = yield program.account.vrgda.fetch(vrgdaPda);
        console.log("Deserialized VRGDA account:", vrgdaAccount);
        const vaultAcc = yield (0, spl_token_1.getAccount)(connection, vrgdaVault, undefined, spl_token_1.TOKEN_PROGRAM_ID);
        console.log("VRGDA Vault:", vaultAcc.address.toString());
        console.log("VRGDA Vault Token Balance:", vaultAcc.amount.toString());
    }));
    it("Buy tokens from VRGDA", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const amountToBuy = new anchor_1.BN(10000000000000);
            const amountToBuy2 = new anchor_1.BN(20000000000000);
            const amountToBuy3 = new anchor_1.BN(1000000000000);
            console.log("Buying tokens from VRGDA...", amountToBuy.toString());
            // Add a Compute Budget instruction to request extra compute units.
            const computeBudgetIx = web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 2000000,
            });
            try {
                // Airdrop SOL to buyers
                yield confirmTx(yield connection.requestAirdrop(buyer.publicKey, 100 * web3_js_1.LAMPORTS_PER_SOL));
                yield confirmTx(yield connection.requestAirdrop(buyer2.publicKey, 100 * web3_js_1.LAMPORTS_PER_SOL));
                yield confirmTx(yield connection.requestAirdrop(buyer3.publicKey, 100 * web3_js_1.LAMPORTS_PER_SOL));
            }
            catch (airdropError) {
                console.error("Airdrop failed:", airdropError);
                throw airdropError;
            }
            // await sleep(80000);
            let txSig, vrgdaAccount, readablePrice;
            try {
                // First buy transaction
                txSig = yield program.methods
                    .buy(amountToBuy)
                    .accountsStrict({
                    buyer: buyer.publicKey,
                    vrgda: vrgdaPda,
                    mint: mintKeypair.publicKey,
                    wsolMint: localWsolMintKeypair.publicKey,
                    buyerWsolAta: buyerwSolAta,
                    buyerAta,
                    vrgdaVault,
                    vrgdaSolAta,
                    authority: authority.publicKey,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                    .signers([buyer])
                    .preInstructions([computeBudgetIx])
                    .rpc();
                yield confirmTx(txSig);
                vrgdaAccount = yield program.account.vrgda.fetch(vrgdaPda);
                readablePrice = formatLamportsToSol(vrgdaAccount.currentPrice);
                console.log("Price after first buy:", readablePrice);
            }
            catch (firstBuyError) {
                console.error("First buy transaction failed:", firstBuyError);
                throw firstBuyError;
            }
            // Wait some time
            // console.log("Waiting 5 seconds to simulate time passing...");
            yield sleep(1000);
            let txSig2, vrgdaAccount_t, readablePrice2;
            try {
                // Second buy transaction
                txSig2 = yield program.methods
                    .buy(amountToBuy2)
                    .accountsStrict({
                    buyer: buyer2.publicKey,
                    vrgda: vrgdaPda,
                    mint: mintKeypair.publicKey,
                    wsolMint: localWsolMintKeypair.publicKey,
                    buyerWsolAta: buyer2wSolAta,
                    buyerAta: buyer2Ata,
                    vrgdaVault,
                    vrgdaSolAta,
                    authority: authority.publicKey,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                    .signers([buyer2])
                    .preInstructions([computeBudgetIx])
                    .rpc();
                yield confirmTx(txSig2);
                vrgdaAccount_t = yield program.account.vrgda.fetch(vrgdaPda);
                readablePrice2 = formatLamportsToSol(vrgdaAccount_t.currentPrice);
                console.log("Price after second buy:", readablePrice2);
            }
            catch (secondBuyError) {
                console.error("Second buy transaction failed:", secondBuyError);
                throw secondBuyError;
            }
            yield sleep(10000);
            let txSig3, vrgdaAccount_3, readablePrice3;
            try {
                // Third buy transaction
                txSig3 = yield program.methods
                    .buy(amountToBuy3)
                    .accountsStrict({
                    buyer: buyer3.publicKey,
                    vrgda: vrgdaPda,
                    mint: mintKeypair.publicKey,
                    wsolMint: localWsolMintKeypair.publicKey,
                    buyerWsolAta: buyer3wSolAta,
                    buyerAta: buyer3Ata,
                    vrgdaVault,
                    vrgdaSolAta,
                    authority: authority.publicKey,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                    .signers([buyer3])
                    .preInstructions([computeBudgetIx])
                    .rpc();
                yield confirmTx(txSig3);
                console.log("Buyer3 tx confirmed:", txSig3);
                vrgdaAccount_3 = yield program.account.vrgda.fetch(vrgdaPda);
                readablePrice3 = formatLamportsToSol(vrgdaAccount_3.currentPrice);
                console.log("Price after third buy:", readablePrice3);
            }
            catch (thirdBuyError) {
                console.error("Third buy transaction failed:", thirdBuyError);
                throw thirdBuyError;
            }
            // Final state checks
            try {
                const vrgdaState = yield program.account.vrgda.fetch(vrgdaPda);
                console.log("VRGDA state after second buy:", vrgdaState.totalSupply.toString());
                const buyerAtaAcc = yield (0, spl_token_1.getAccount)(connection, buyerAta, undefined, spl_token_1.TOKEN_PROGRAM_ID);
                console.log("Buyer token balance after buy:", buyerAtaAcc.amount.toString());
                const buyer2AtaAcc = yield (0, spl_token_1.getAccount)(connection, buyer2Ata, undefined, spl_token_1.TOKEN_PROGRAM_ID);
                console.log("Buyer2 token balance after buy:", buyer2AtaAcc.amount.toString());
            }
            catch (stateCheckError) {
                console.error("Error checking final state:", stateCheckError);
                throw stateCheckError;
            }
        }
        catch (overallError) {
            console.error("Overall test failed:", overallError);
            // Optionally re-throw to ensure test fails
            throw overallError;
        }
    }));
    //   it("should successfully sell tokens back to VRGDA", async () => {
    //     // First, buy some tokens to establish a baseline
    //     const buyAmount = new BN(500_000_000_000);
    //     const sellAmount = new BN(250_000_000_000);
    //     const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
    //         units: 600_000,
    //     });
    //     try {
    //         // Sell tokens back
    //         const sellTx = await program.methods
    //             .sell(buyAmount)
    //             .accounts({
    //                 seller: buyer.publicKey,
    //                 vrgda: vrgdaPda,
    //                 mint: mintKeypair.publicKey,
    //                 wsolMint: localWsolMintKeypair.publicKey,
    //                 sellerWsolAta: buyerwSolAta,
    //                 sellerAta: buyerAta,
    //                 vrgdaVault,
    //                 vrgdaSolAta,
    //                 authority: authority.publicKey,
    //                 tokenProgram: TOKEN_PROGRAM_ID,
    //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //                 systemProgram: SystemProgram.programId,
    //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             })
    //             .signers([buyer])
    //             .preInstructions([computeBudgetIx])
    //             .rpc();
    //         await confirmTx(sellTx);
    //         // Verify VRGDA state after sell
    //         const vrgdaAccount = await program.account.vrgda.fetch(vrgdaPda);
    //         console.log("VRGDA state after sell:", {
    //             tokensSold: vrgdaAccount.tokensSold.toString(),
    //             totalSupply: vrgdaAccount.totalSupply.toString(),
    //             currentPrice: vrgdaAccount.currentPrice.toString()
    //         });
    //         // Check seller's token balances
    //         const sellerMintAcc = await getAccount(connection, buyer.publicKey, undefined, TOKEN_PROGRAM_ID);
    //         const sellerWsolAcc = await getAccount(connection, buyerwSolAta, undefined, TOKEN_PROGRAM_ID);
    //         console.log("Seller Mint Balance:", sellerMintAcc.amount.toString());
    //         console.log("Seller WSOL Balance:", sellerWsolAcc.amount.toString());
    //     } catch (error) {
    //         console.error("Sell test failed:", error);
    //         throw error;
    //     }
    // });
    // it("should fail to sell 0 tokens", async () => {
    //     try {
    //         const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
    //             units: 600_000,
    //         });
    //         const sellTx = await program.methods
    //             .sell(new BN(0))
    //             .accounts({
    //                 seller: buyer.publicKey,
    //                 vrgda: vrgdaPda,
    //                 mint: mintKeypair.publicKey,
    //                 wsolMint: localWsolMintKeypair.publicKey,
    //                 sellerWsolAta: buyerwSolAta,
    //                 sellerAta: buyerAta,
    //                 vrgdaVault,
    //                 vrgdaSolAta,
    //                 authority: authority.publicKey,
    //                 tokenProgram: TOKEN_PROGRAM_ID,
    //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //                 systemProgram: SystemProgram.programId,
    //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             })
    //             .signers([buyer])
    //             .preInstructions([computeBudgetIx])
    //             .rpc();
    //         await confirmTx(sellTx);
    //         throw new Error("Should have failed to sell 0 tokens");
    //     } catch (error) {
    //         // Check if error is the expected AmountCantBeZero error
    //         if (error instanceof anchor.AnchorError) {
    //         } else {
    //             throw error;
    //         }
    //     }
    // });
    // it("should fail to sell more tokens than purchased", async () => {
    //     try {
    //         // First, buy some tokens
    //         const buyAmount = new BN(500_000_000_000);
    //         const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
    //             units: 600_000,
    //         });
    //         const buyTx = await program.methods
    //             .buy(buyAmount)
    //             .accounts({
    //                 buyer: buyer.publicKey,
    //                 vrgda: vrgdaPda,
    //                 mint: mintKeypair.publicKey,
    //                 wsolMint: localWsolMintKeypair.publicKey,
    //                 buyerWsolAta: buyerwSolAta,
    //                 buyerAta: buyerAta,
    //                 vrgdaVault,
    //                 vrgdaSolAta,
    //                 authority: authority.publicKey,
    //                 tokenProgram: TOKEN_PROGRAM_ID,
    //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //                 systemProgram: SystemProgram.programId,
    //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             })
    //             .signers([buyer])
    //             .preInstructions([computeBudgetIx])
    //             .rpc();
    //         await confirmTx(buyTx);
    //         // Try to sell more tokens than purchased
    //         const impossibleSellAmount = buyAmount.add(new BN(1));
    //         const sellTx = await program.methods
    //             .sell(impossibleSellAmount)
    //             .accounts({
    //                 seller: buyer.publicKey,
    //                 vrgda: vrgdaPda,
    //                 mint: mintKeypair.publicKey,
    //                 wsolMint: localWsolMintKeypair.publicKey,
    //                 sellerWsolAta: buyerwSolAta,
    //                 sellerAta: buyerAta,
    //                 vrgdaVault,
    //                 vrgdaSolAta,
    //                 authority: authority.publicKey,
    //                 tokenProgram: TOKEN_PROGRAM_ID,
    //                 associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //                 systemProgram: SystemProgram.programId,
    //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             })
    //             .signers([buyer])
    //             .preInstructions([computeBudgetIx])
    //             .rpc();
    //         await confirmTx(sellTx);
    //         throw new Error("Should have failed to sell more tokens than purchased");
    //     } catch (error) {
    //         // Check if error is the expected AmountExceedsTotalSupply error
    //         if (error instanceof anchor.AnchorError) {
    //         } else {
    //             throw error;
    //         }
    //     }
    // });
});
// Just a utility
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Define the scaling factor: for SOL, 1 SOL = 1e9 lamports.
/**
 * Converts a BN price in lamports to a human-readable SOL string.
 * For example, if the price is 1234567890 lamports, it will return "1.234567890".
 */
function formatLamportsToSol(priceLamports) {
    const solInteger = priceLamports.div(new anchor_1.BN(web3_js_1.LAMPORTS_PER_SOL));
    const solRemainder = priceLamports.mod(new anchor_1.BN(web3_js_1.LAMPORTS_PER_SOL));
    // Pad the remainder with zeros to ensure 9 decimal places.
    return `${solInteger.toString()}.${solRemainder.toString().padStart(9, "0")}`;
}
function percent(percent) {
    return new anchor_1.BN(Math.floor((percent / 100) * 18446744073709551615)); // uint64 max value
}
function waitForUnixTime(connection_1, unixTime_1) {
    return __awaiter(this, arguments, void 0, function* (connection, unixTime, sleepInterval = 500) {
        while ((yield getClockTime(connection)) < unixTime) {
            yield sleep(sleepInterval);
        }
    });
}
function getClockTime(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const clock = (yield connection.getAccountInfo(web3_js_1.SYSVAR_CLOCK_PUBKEY));
        return clock.data.readBigInt64LE(8 * 4);
    });
}
/*
 {
      "name": "U192",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "",
            "type": "u64"
          },
          {
            "name": "",
            "type": "u64"
          },
          {
            "name": "",
            "type": "u64"
          }
        ]
      }
    },
 */
